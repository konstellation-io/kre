import datetime
import json
import os

from nats.aio.client import ErrTimeout


class HandlerContext:
    ERR_MISSING_VALUES = "missing_values"
    ERR_NEW_LABELS = "new_labels"

    def __init__(self, config, nc, mongo_conn, logger):
        self.__config__ = config
        self.__nc__ = nc
        self.__mongo_conn__ = mongo_conn
        self.logger = logger
        self.METRIC_ERRORS = [self.ERR_MISSING_VALUES, self.ERR_NEW_LABELS]

    def get_path(self, relative_path):
        return os.path.join(self.__config__.base_path, relative_path)

    def set_value(self, key, value):
        setattr(self, key, value)

    def get_value(self, key):
        return getattr(self, key)

    async def save_metric(self, predicted_value="", true_value="", date="", error=""):
        if error != "":
            if error not in self.METRIC_ERRORS:
                raise Exception(f"[ctx.save_metric] invalid value for metric error {error} "
                                f"should be one of '{','.join(self.METRIC_ERRORS)}'")
        else:
            if not isinstance(predicted_value, str) or predicted_value == "":
                raise Exception(f"[ctx.save_metric] invalid 'predicted_value'='{predicted_value}',"
                                f" must be a nonempty string")
            if not isinstance(true_value, str) or true_value == "":
                raise Exception(f"[ctx.save_metric] invalid 'true_value'='{true_value}', must be a nonempty string")

        if date == "":
            d = datetime.datetime.utcnow()
            date = d.isoformat("T") + "Z"
        else:
            try:
                datetime.datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ")
            except ValueError:
                raise Exception(f"[ctx.save_metric] invalid 'date'='{date}', must be a RFC 3339 date like: "
                                "2020-04-06T09:02:09.277853Z")

        coll = "classificationMetrics"
        doc = {
            "date": date,
            "error": error,
            "predictedValue": predicted_value,
            "trueValue": true_value,
            "versionId": self.__config__.krt_version_id,
            "versionName": self.__config__.krt_version
        }

        try:
            subject = self.__config__.nats_mongo_writer
            payload = bytes(json.dumps({"coll": coll, "doc": doc}), encoding='utf-8')
            response = await self.__nc__.request(subject, payload, timeout=1)
            res_json = json.loads(response.data.decode())
            if not res_json['success']:
                self.logger.error("Unexpected error saving metric")
        except ErrTimeout:
            self.logger.error("Error saving metric: request timed out")

    async def save_data(self, coll, data):
        if not isinstance(coll, str) or coll == "":
            raise Exception(f"[ctx.save_data] invalid 'collection'='{coll}', must be a nonempty string")

        try:
            subject = self.__config__.nats_mongo_writer
            payload = bytes(json.dumps({"coll": coll, "doc": data}), encoding='utf-8')
            response = await self.__nc__.request(subject, payload, timeout=1)
            res_json = json.loads(response.data.decode())
            if not res_json['success']:
                self.logger.error("Unexpected error saving data")
        except ErrTimeout:
            self.logger.error("Error saving data: request timed out")

    async def get_data(self, coll, query):
        if not isinstance(coll, str) or coll == "":
            raise Exception(f"[ctx.save_data] invalid 'collection'='{coll}', must be a nonempty string")

        if not isinstance(query, dict) or not query:
            raise Exception(f"[ctx.get_data] invalid 'query'='{query}', must be a nonempty dict")

        try:
            collection = self.__mongo_conn__[self.__config__.mongo_db_name][coll]
            self.logger.debug(f"call to mongo to get data on{self.__config__.mongo_db_name}.{coll}: {query}")
            cursor = collection.find(query)
            return list(cursor)

        except Exception as err:
            raise Exception(f"[ctx.get_data] error getting data from MongoDB: {err}")
