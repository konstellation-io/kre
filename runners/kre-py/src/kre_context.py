import datetime
import json
import os

from nats.aio.client import ErrTimeout


class HandlerContext:

    def __init__(self, config, nc, mongo_conn, logger):
        self.__data__ = lambda: None
        self.__config__ = config
        self.logger = logger
        self.metrics = ContextMetrics(config, nc, logger)
        self.db = ContextData(config, nc, mongo_conn, logger)

    def path(self, relative_path):
        return os.path.join(self.__config__.base_path, relative_path)

    def set(self, key, value):
        setattr(self.__data__, key, value)

    def get(self, key):
        return getattr(self.__data__, key)


class ContextMetrics:
    ERR_MISSING_VALUES = "missing_values"
    ERR_NEW_LABELS = "new_labels"

    def __init__(self, config, nc, logger):
        self.METRIC_ERRORS = [self.ERR_MISSING_VALUES, self.ERR_NEW_LABELS]
        self.__config__ = config
        self.__nc__ = nc
        self.logger = logger

    async def save(self, predicted_value="", true_value="", date="", error=""):
        if error != "":
            if error not in self.METRIC_ERRORS:
                raise Exception(f"[ctx.metrics.save] invalid value for metric error {error} "
                                f"should be one of '{','.join(self.METRIC_ERRORS)}'")
        else:
            if not isinstance(predicted_value, str) or predicted_value == "":
                raise Exception(f"[ctx.metrics.save] invalid 'predicted_value'='{predicted_value}',"
                                f" must be a nonempty string")
            if not isinstance(true_value, str) or true_value == "":
                raise Exception(f"[ctx.metrics.save] invalid 'true_value'='{true_value}', must be a nonempty string")

        if date == "":
            d = datetime.datetime.utcnow()
            date = d.isoformat("T") + "Z"
        else:
            try:
                datetime.datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ")
            except ValueError:
                raise Exception(f"[ctx.metrics.save] invalid 'date'='{date}', must be a RFC 3339 date like: "
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


class ContextData:

    def __init__(self, config, nc, mongo_conn, logger):
        self.__config__ = config
        self.__nc__ = nc
        self.__mongo_conn__ = mongo_conn
        self.logger = logger

    async def save(self, coll, data):
        if not isinstance(coll, str) or coll == "":
            raise Exception(f"[ctx.db.save] invalid 'collection'='{coll}', must be a nonempty string")

        try:
            subject = self.__config__.nats_mongo_writer
            payload = bytes(json.dumps({"coll": coll, "doc": data}), encoding='utf-8')
            response = await self.__nc__.request(subject, payload, timeout=1)
            res_json = json.loads(response.data.decode())
            if not res_json['success']:
                self.logger.error("Unexpected error saving data")
        except ErrTimeout:
            self.logger.error("Error saving data: request timed out")

    async def find(self, coll, query):
        if not isinstance(coll, str) or coll == "":
            raise Exception(f"[ctx.db.save] invalid 'collection'='{coll}', must be a nonempty string")

        if not isinstance(query, dict) or not query:
            raise Exception(f"[ctx.db.find] invalid 'query'='{query}', must be a nonempty dict")

        try:
            collection = self.__mongo_conn__[self.__config__.mongo_db_name][coll]
            self.logger.debug(f"call to mongo to get data on{self.__config__.mongo_db_name}.{coll}: {query}")
            cursor = collection.find(query)
            return list(cursor)

        except Exception as err:
            raise Exception(f"[ctx.db.find] error getting data from MongoDB: {err}")
