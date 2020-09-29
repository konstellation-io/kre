import json


class KreNatsMessage:
    def __init__(self, reply='', data=None, error=None, msg=None, tracking_id=None, tracking=[]):
        if msg is not None:
            self.unmarshal(msg)
        else:
            self.tracking_id = tracking_id
            self.tracking = tracking
            self.reply = reply
            self.data = json.dumps(data)
            self.error = error

    def unmarshal(self, msg):
        try:
            msg = json.loads(msg.data.decode())

            self.tracking_id = msg.get("tracking_id")
            self.tracking = msg.get("tracking")
            self.reply = msg.get("reply")
            self.data = json.loads(msg.get("data"))
            self.error = msg.get("error")

        except Exception as err:
            raise Exception(f"error parsing msg.data because is not a valid JSON: {str(err)}")

    def marshal(self):
        return bytes(self.to_json(), encoding='utf-8')

    def to_json(self):
        return json.dumps(self.__dict__)

    def __str__(self):
        return f"KreNatsMessage: '{self.to_json()}'"
