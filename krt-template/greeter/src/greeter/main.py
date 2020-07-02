async def init(ctx):
    ctx.logger.info("[worker init]")
    ctx.set_value("greeting", "Hello")


async def handler(ctx, data):
    ctx.logger.info("[worker handler]")
    result = f"{ctx.get_value('greeting')} {data['name']}!"
    ctx.logger.info(result)

    # Saves metrics in MongoDB DB sending a message to the MongoWriter queue
    await ctx.save_metric(date="2020-04-06T09:02:09.277853Z",
                          predicted_value="class_x", true_value="class_y")
    await ctx.save_metric(error=ctx.ERR_MISSING_VALUES,
                          date="2020-04-07T00:00:00.0Z")
    # If the date is not set, the 'date' field value will be now
    await ctx.save_metric(error=ctx.ERR_NEW_LABELS)

    return {"greeting": result}  # Must be a serializable JSON
