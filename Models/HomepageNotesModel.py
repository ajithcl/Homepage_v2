from pymongo import MongoClient
import datetime
from datetime import date
from bson import ObjectId

class Notes_Class:
    def __init__(self):
        self.client = MongoClient()
        self.db = self.client.PersonalWebDb
        self.notes_collection = self.db.HomepageNotes

    def create_Notes_One(self, data):
        str_curr_date = str(date.today())
        curr_date = datetime.datetime.strptime(str_curr_date, "%Y-%m-%d")
        data["created_date"] = curr_date
        try:
            result = self.notes_collection.insert_one(data)
            if result:
                return "success"
            else:
                return "error"
        except:
            return result

    def getAllNotes(self):
        results = self.notes_collection.find()
        return results

    def delete_notes(self, row_id):
        try:
            result = self.notes_collection.delete_one({"_id": ObjectId(row_id["_id"])})
            if result.deleted_count > 0:
                return "success"
            else:
                return "error"
        except:
            return "error"
        return "error"

