import os

from context_measurement import ContextMeasurement
from context_prediction import ContextPrediction
from context_data import ContextData


class HandlerContext:
    def __init__(self, config, nc, mongo_conn, logger):
        self.__data__ = lambda: None
        self.__config__ = config
        self.logger = logger
        self.prediction = ContextPrediction(config, nc, logger)
        self.measurement = ContextMeasurement(config, logger)
        self.db = ContextData(config, nc, mongo_conn, logger)

    def path(self, relative_path):
        return os.path.join(self.__config__.base_path, relative_path)

    def set(self, key, value):
        setattr(self.__data__, key, value)

    def get(self, key):
        return getattr(self.__data__, key)
