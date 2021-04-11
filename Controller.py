# Date : 14 May 2020
# Author : Ajith kumar CL
import datetime
import socket
import sys
import web
import logging
import requests
from bs4 import BeautifulSoup

sys.path.append("D:\\Ajith\\PythonProject\\LookAtYou\\")  # For including classes from LookAtYou project
from Models import ExpenseModel, ReminderModel, HealthModel
from Models import HomepageNotesModel, UrlsModel

log_filename = "D:\\Ajith\\PythonProject\\Homepage_v2\\logs\\log.txt"
logging.basicConfig(filename=log_filename,
                    level=logging.INFO,
                    format="%(asctime)s - %(message)s")
logging.info("Starting")
web.config.debug = False

urls = ('/', 'Home',
        '/savelink', 'SaveLink',
        '/delete_link', 'DeleteLink',
        '/update_link_count', 'UpdateLinkCount',
        '/savenotes', 'SaveNotes',
        '/deletenotes', 'DeleteNotes',
        '/get_exercise_status', 'get_exercise_status',
        '/update_exercise_status', 'update_exercise_status',
        '/SarusVlogAnalysis', 'SarusVlogAnalysis')

app = web.application(urls, globals())
session = web.session.Session(app, web.session.DiskStore("sessions"))
session_data = session._initializer
render = web.template.render("Views/Templates", base="MainLayout")


class Home:
    def GET(self):
        host_name = socket.gethostname()
        tech_information = {"system_name": host_name,
                            "ip_address": socket.gethostbyname(host_name),
                            "last_backup_date": "---"}

        # Expense data
        expense = ExpenseModel.Expense()
        current_month_expense = expense.getCurrentMonthAmount("Ajith")
        monthly_avg_expense = expense.getAverageMonthlyExpense("Ajith")
        current_year = datetime.date.today().year
        if datetime.date.today().month == 1:
            prev_month = 12
            prev_year = current_year - 1
        else:
            prev_month = datetime.date.today().month - 1
            prev_year = current_year
        last_month_expense_amount = expense.get_nth_month_amount(userid="Ajith",
                                                                 month_n=prev_month,
                                                                 year_n=prev_year)
        monthly_exp_warning = False
        # 5000 is just the threshold value
        if current_month_expense > 0.00:
            if (current_month_expense >= (monthly_avg_expense - 5000) or
                    current_month_expense >= (last_month_expense_amount - 5000)):
                monthly_exp_warning = True
            else:
                monthly_exp_warning = False
        expense_info = {"current_month": current_month_expense,
                        "expense_warn": monthly_exp_warning}

        # URLS data
        urls_class = UrlsModel.Urls_class()
        urls_documents = urls_class.get_urls()
        urls_data_list = []
        for record in urls_documents:
            url_dict = {"name": record["name"],
                        "url": record["url"],
                        "type": record["type"],
                        "click_count": record["click_count"],
                        "type": record["type"],
                        "_id": record["_id"],
                        "accessed_on": datetime.datetime.strftime(record["last_accessed_date"], "%d/%m/%Y")}
            urls_data_list.append(url_dict)

        # Notes data
        notes_class = HomepageNotesModel.Notes_Class()
        notes_documents = notes_class.getAllNotes()
        notes_list = []
        for record in notes_documents:
            notes_dict = {"_id": record["_id"],
                          "title": record["title"],
                          "notes": record["notes"]}
            notes_list.append(notes_dict)

        # Reminders data
        reminders_class = ReminderModel.Reminder()
        curr_date = datetime.datetime.today()
        result = reminders_class.get_n_reminders("Ajith", curr_date, 1)
        reminders_list = []
        if result:
            for record in result:
                reminders_list.append({"reminder": record["EventName"],
                                       "duedate": datetime.date.strftime(record["ReminderDate"], "%Y-%m-%d")})

        # Weather information\
        weather_info = get_weather_details()

        # Exercise information
        health_class = HealthModel.Health()

        # Collect all the information
        page_data = {"technical_information": tech_information,
                     "expense_information": expense_info,
                     "urls": urls_data_list,
                     "notes_list": notes_list,
                     "reminders_list": reminders_list,
                     "weather_info": weather_info}

        return render.Home(page_data)


class SaveLink:
    def POST(self):
        form_data = web.input()
        url_class = UrlsModel.Urls_class()
        result = url_class.create_urls_one(form_data)
        return result


class UpdateLinkCount:
    def POST(self):
        input_data = web.input()
        url_class = UrlsModel.Urls_class()
        result = url_class.update_url_count(input_data["link_name"])
        return result


class DeleteLink:
    def POST(self):
        input_data = web.input()
        url_class = UrlsModel.Urls_class()
        result = url_class.delete_url_one(input_data["_id"])
        return result


class SaveNotes:
    def POST(self):
        form_data = web.input()
        notes_class = HomepageNotesModel.Notes_Class()
        result = notes_class.create_Notes_One(form_data)
        return result


class DeleteNotes:
    def POST(self):
        input_data = web.input()
        notes_class = HomepageNotesModel.Notes_Class()
        result = notes_class.delete_notes(input_data)
        return result


class get_exercise_status:
    def GET(self):
        health_model = HealthModel.Health()
        result = health_model.get_exercise_status(userid="Ajith")
        return result


class update_exercise_status:
    def POST(self):
        input_data = web.input()
        if input_data["value"] == 'true':
            input_data = True
        elif input_data["value"] == 'false':
            input_data = False
        else:
            input_data = False
        health_model = HealthModel.Health()
        try:
            result = health_model.update_exercise_status(userid="Ajith",
                                                         exercise_status=input_data)
            if result['ok'] == 1.0:
                return "success"
            else:
                return "error"
        except Exception as ex:
            return "error"


def get_weather_details():
    try:
        web_page = requests.get("https://weather.com/en-IN/weather/today")
        soup = BeautifulSoup(web_page.content, 'html.parser')
        web_body = soup.body
        if web_body.find(attrs={"data-testid": "TemperatureValue"}) is not None:
            temperature_value = web_body.find(attrs={"data-testid": "TemperatureValue"}).getText()
        else:
            temperature_value = ""
        if web_body.find(attrs={"data-testid": "wxPhrase"}) is not None:
            temperature_phrase = web_body.find(attrs={"data-testid": "wxPhrase"}).getText()
        else:
            temperature_phrase = ""
        if web_body.find(attrs={"data-testid": "precipPhrase"}) is not None:
            precip_phrase = web_body.find(attrs={"data-testid": "precipPhrase"}).getText()
        else:
            precip_phrase = ""
    except:
        temperature_value, temperature_phrase, precip_phrase = "", "", ""
    result = {"temperature": temperature_value,
              "temperature_phrase": temperature_phrase,
              "precip_phrase": precip_phrase}
    return result


class SarusVlogAnalysis():
    def GET(self):
        return render.Sarusvlog_analysis()


if __name__ == "__main__":
    app.run()
