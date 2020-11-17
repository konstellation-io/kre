from datetime import datetime
from public_input_pb2 import Request, Response


async def init(ctx):
    ctx.logger.info("[worker init]")
    ctx.set("greeting", "Hello")


async def handler(ctx, data):
    ctx.logger.info("[worker handler]")

    req = Request()
    data.Unpack(req)

    result = f"{ctx.get('greeting')} {req.name}!"
    ctx.logger.info(result)

    # Saves metrics in MongoDB DB sending a message to the MongoWriter queue
    await ctx.prediction.save(utcdate=datetime.strptime("2020-04-06T09:02:09.277853Z", "%Y-%m-%dT%H:%M:%S.%fZ"),
                              predicted_value="class_x", true_value="class_y")
    await ctx.prediction.save(error=ctx.prediction.ERR_MISSING_VALUES,
                              utcdate=datetime.strptime("2020-04-07T00:00:00Z", "%Y-%m-%dT%H:%M:%SZ"))
    # If the date is not set, the 'date' field value will be now
    await ctx.prediction.save(error=ctx.prediction.ERR_NEW_LABELS)

    # Save a measurement to show later in a Chronograf dashboard
    ctx.measurement.save("greetings", {"name": req.name}, {
                         "node": "handler"})

    # Saving salutation into DB for later analysis or use
    await ctx.db.save("greeter", {"greeting": result})

    res = Response()
    res.greeting = result

    return res
