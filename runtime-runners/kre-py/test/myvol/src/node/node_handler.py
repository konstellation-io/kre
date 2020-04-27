
def init(ctx):
    print("[worker init]")
    ctx.set_value("greeting", "Hello")


def handler(ctx, data):
    print("[worker handler]")
    result = f"{ctx.get_value('greeting')} {data['name']}!"
    print(result)

    # ctx.save_metric(true_value="classX", predicted_value="classY", error=ctx.ERR_MISSING_VALUES)
    ctx.save_metric(true_value="classX", predicted_value="classY", date="2020-04-06T00:00:00.0Z")

    return {"result": result}  # Must be a serializable JSON
