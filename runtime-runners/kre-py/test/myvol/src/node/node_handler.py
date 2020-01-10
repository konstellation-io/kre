
def init(ctx):
    print("[worker init]")
    ctx.set_value("name", "John")


def handler(ctx, data):
    print("[worker handler]")
    print("Hello " + ctx.get_value("name") + ": " + data["msg"])
    ctx.save_metric("elapsedtime", 1234)
    return {"test": data}  # Must be a serializable JSON
