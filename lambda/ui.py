"""
# ui.py
# Author: Adam Campbell
# Date: 12/08/2016
"""

class UI(object):

    def __init__(self, event, context):
        self.event = event
        self.context = context
        with open("constants.json", "r") as constants_file:
            self.constants = json.loads(constants_file.read())
        with open("forms.json", "r") as forms_file:
            self.forms = json.loads(forms_file.read())

<<<<<<< HEAD
    def getForm(self, data, type):
        
        # Get form json from json file
        form_data = self.forms[type]
        print form_data
        if data is not None:
            # populate json fields

        # will return json
        return None
=======
    def getForm(self, data):
        pass
>>>>>>> Master
        


        