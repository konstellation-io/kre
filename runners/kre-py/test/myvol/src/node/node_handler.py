def init(ctx):
    print("[worker init]")
    ctx.set_value("greeting", "Hello")


async def handler(ctx, data):
    print("[worker handler]")
    result = f"{ctx.get_value('greeting')} {data['name']}!"
    print(result)

    print("Saving some metrics...")
    # Saves metrics in MongoDB DB sending a message to the MongoWriter queue
    await ctx.save_metric(date="2020-04-06T09:02:09.277853Z", predicted_value="class_x", true_value="class_y")
    await ctx.save_metric(error=ctx.ERR_MISSING_VALUES, date="2020-04-07T00:00:00.0Z")
    await ctx.save_metric(error=ctx.ERR_NEW_LABELS)  # If the date is not set, the 'date' field value will be now

    print("Saving some data...")
    # Saves data in MongoDB DB sending a message to the MongoWriter queue
    await ctx.save_data("test_data", {"random": 123, "dict": {"some": True, "value": 0}})

    return {"result": result}  # Must be a serializable JSON
