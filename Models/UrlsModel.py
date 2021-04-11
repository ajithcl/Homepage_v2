import pymongo
from pymongo import MongoClient
import datetime
from datetime import date
from bson import ObjectId


class Urls_class:
    def __init__(self):
        self.client = MongoClient()
        self.db = self.client.PersonalWebDb
        self.urls_collection = self.db.Urls

    def create_urls_one(self, data):
        str_curr_date = str(date.today())
        curr_date = datetime.datetime.strptime(str_curr_date, "%Y-%m-%d")
        input_data = {"create_date": curr_date,
                      "last_accessed_date": curr_date,
                      "name": data["url_name"],
                      "url": data["url_address"],
                      "type": data["url_type"],
                      "click_count": 0}
        try:
            result = self.urls_collection.insert_one(input_data)
        except:
            return "error"
        if result:
            return "success"
        else:
            return "error"

    def get_urls(self):
        results = self.urls_collection.find().sort('click_count', pymongo.DESCENDING)
        return results

    def update_url_count(self, url_name):
        str_curr_date = str(date.today())
        curr_date = datetime.datetime.strptime(str_curr_date, "%Y-%m-%d")
        try:
            result = self.urls_collection.find({"name": url_name})
            for record in result:
                self.urls_collection.update_one({"name": url_name},
                                                {"$set": {"click_count": record["click_count"] + 1,
                                                          "last_accessed_date": curr_date}})
        except:
            return "error"
        return "success"

    def delete_url_one(self, url_id):
        try:
            result = self.urls_collection.delete_one({"_id": ObjectId(url_id)})
            if result.deleted_count > 0:
                return "success"
            else:
                return "error"
        except:
            return "error"
