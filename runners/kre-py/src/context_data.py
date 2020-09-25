import json

from nats.aio.client import ErrTimeout


class ContextData:
    def __init__(self, config, nc, mongo_conn, logger):
        self.__config__ = config
        self.__nc__ = nc
        self.__mongo_conn__ = mongo_conn
        self.__logger__ = logger

    async def save(self, coll, data):
        if not isinstance(coll, str) or coll == "":
            raise Exception(f"[ctx.db.save] invalid 'collection'='{coll}', must be a nonempty string")

        try:
            subject = self.__config__.nats_mongo_writer
            payload = bytes(json.dumps({"coll": coll, "doc": data}), encoding='utf-8')
            response = await self.__nc__.request(subject, payload, timeout=1)
            res_json = json.loads(response.data.decode())
            if not res_json['success']:
                self.__logger__.error("Unexpected error saving data")
        except ErrTimeout:
            self.__logger__.error("Error saving data: request timed out")

    async def find(self, coll, query):
        if not isinstance(coll, str) or coll == "":
            raise Exception(f"[ctx.db.save] invalid 'collection'='{coll}', must be a nonempty string")

        if not isinstance(query, dict) or not query:
            raise Exception(f"[ctx.db.find] invalid 'query'='{query}', must be a nonempty dict")

        try:
            collection = self.__mongo_conn__[self.__config__.mongo_data_db_name][coll]
            self.__logger__.debug(f"call to mongo to get data on{self.__config__.mongo_data_db_name}.{coll}: {query}")
            cursor = collection.find(query)
            return list(cursor)

        except Exception as err:
            raise Exception(f"[ctx.db.find] error getting data from MongoDB: {err}")
