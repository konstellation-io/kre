from datetime import datetime

from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS


class ContextMeasurement:
    def __init__(self, config, logger):
        self.__config__ = config
        self.__logger__ = logger

        client = InfluxDBClient(url=self.__config__.influx_uri, token=self.__config__.influx_token)
        self.__write_api__ = client.write_api(write_options=SYNCHRONOUS)

    def save(self, measurement: str, fields: dict, tags: dict):
        point = Point(measurement)

        for key in fields:
            point.field(key, fields[key])

        for key in tags:
            point.tag(key, tags[key])

        point.time(datetime.utcnow(), WritePrecision.NS)

        cfg = self.__config__
        self.__write_api__.write(cfg.influx_bucket, cfg.influx_org, point)
