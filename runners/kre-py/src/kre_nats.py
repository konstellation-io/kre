import json


class KreNatsMessage:
    def __init__(self, reply='', data=None, error=None, msg=None):
        if msg is not None:
            self.unmarshal(msg)
        else:
            self.reply = reply
            self.data = json.dumps(data)
            self.error = error

    def unmarshal(self, msg):
        try:
            msg = json.loads(msg.data.decode())

            self.reply = msg.get("reply")
            self.data = json.loads(msg.get("data"))
            self.error = msg.get("error")

        except Exception as err:
            raise Exception(f"error parsing msg.data because is not a valid JSON: {str(err)}")

    def marshal(self):
        return bytes(json.dumps(self.__dict__), encoding='utf-8')

    def __str__(self):
        return f"KreNatsMessage: '{json.dumps(self.__dict__)}'"
