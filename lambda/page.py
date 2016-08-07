"""
# page.py
# Author: Miguel Saavedra
# Date: 17/07/2016
# Edited: 07/08/2016 | Christopher Treadgold
"""

import json
import uuid
import datetime

import boto3
import botocore
from boto3.dynamodb.conditions import Attr, Key

from response import Response

class Page(object):

    def __init__(self, event, context):
        self.event = event
        self.context = context
        # Blog variables
        self.s3 = boto3.client('s3')
        self.Index_file= "PageIndex.html"
        with open("constants.json", "r") as constants_file:
            self.constants = json.loads(constants_file.read())


    def get_all_pages(self):
        # Attempt to get all data from table
        try:
            dynamodb = boto3.client('dynamodb')
            data = dynamodb.scan(TableName=self.constants["PAGE_TABLE"],
                                 ConsistentRead=True)
        except botocore.exceptions.ClientError as e:
            print e.response['Error']['Code']
            response = Response("Error", None)
            response.errorMessage = "Unable to get page data: %s" % e.response['Error']['Code']
            return response.to_JSON()
        
        response = Response("Success", data)
        # response.setData = data
        return response.format("All Pages")


    def create_page(self):
        # Get new blog params
        page_id = str(uuid.uuid4())
        author = self.event["page"]["pageAuthor"]
        title = self.event["page"]["pageTitle"]
        content = self.event["page"]["pageContent"]
        meta_description = self.event["page"]["metaDescription"]
        meta_keywords = self.event["page"]["metaKeywords"]
        saved_date = str(datetime.datetime.now())

        page_params = {
            "PageID": {"S": page_id},
            "Author": {"S": author},
            "Title": {"S": title},
            "Content": {"S": content},
            "SavedDate": {"S": saved_date},
            "MetaDescription": {"S": meta_description},
            "MetaKeywords": {"S": meta_keywords},
        }

        try:
            dynamodb = boto3.client('dynamodb')
            dynamodb.put_item(
                TableName=self.constants["PAGE_TABLE"],
                Item=page_params,
                ReturnConsumedCapacity='TOTAL'
            )

        except botocore.exceptions.ClientError as e:
            print e.response['Error']['Code']
            response = Response("Error", None)
            response.errorMessage = "Unable to save new page: %s" % e.response['Error']['Code']

            if e.response['Error']['Code'] == "NoSuchKey":
                self.update_index(page_id, title)
                self.save_new_index()
            else:
                return response.to_JSON()

        self.put_page_object(page_id, author, title, content, saved_date,
                meta_description, meta_keywords)
        return Response("Success", None).to_JSON()


    def edit_page(self):
        page_id = self.event["page"]["pageID"]
        author = self.event["page"]["pageAuthor"]
        title = self.event["page"]["pageTitle"]
        content = self.event["page"]["pageContent"]
        meta_description = self.event["page"]["metaDescription"]
        meta_keywords = self.event["page"]["metaKeywords"]
        
        try:
            dynamodb = boto3.client('dynamodb')
            page = dynamodb.query(
                TableName=self.constants["PAGE_TABLE"],
                KeyConditionExpression="PageID = :v1",
                ExpressionAttributeValues={
                    "v1": {
                        "S": page_id
                    }
                }
            )
            saved_date = page["Items"][0]["SavedDate"]
            
            dynamodb.update_item(
                TableName=self.constants["PAGE_TABLE"],
                Key={"PageID": page_id, "Author": author},
                UpdateExpression=(
                    "set Title=:t Content=:c SavedDate=:s "
                    "MetaDescription=:d MetaKeywords=:k"
                ),
                ExpressionAttributeValues={
                    ":t": title, ":c": content, ":s": saved_date,
                    ":d": meta_description, ":k": meta_keywords
                }
            )
        except botocore.exceptions.ClientError as e:
            print e.response['Error']['Code']
            response = Response("Error", None)
            response.errorMessage = "Unable to save new page: %s" % e.response['Error']['Code']

            if e.response['Error']['Code'] == "NoSuchKey":
                self.update_index(blogID, title)
                self.save_new_blog()
            else:
                return response.to_JSON()

        self.put_page_object(page_id, author, title, content, saved_date,
                meta_description, meta_keywords)
        return Response("Success", None).to_JSON()


    def delete_page(self):
        page_id =self.event['page']['pageID']
        author = self.event['page']['pageAuthor']
        
        try:
            dynamodb = boto3.client('dynamodb')
            dynamodb.delete_item(
                TableName=self.constants["PAGE_TABLE"],
                Key={'PageID': page_id, 'Author': author}
            )
        except botocore.exceptions.ClientError as e:
            print e.response['Error']['Code']
            response = Response("Error", None)
        response.errorMessage = "Unable to delete page: %s" % e.response['Error']['Code']
        return response.to_JSON()

        self.update_index()
        return Response("Success", None).to_JSON()


    def update_index(self):
        indexContent = '<html><head><title>Page Index</title></head><body><h1>Index</h1>'
        blogData = {'items': [None]}
        blogTitle = ''
        
        dynamodb = boto3.client('dynamodb')
        data = dynamodb.scan(TableName=self.constants["PAGE_TABLE"],
                             ConsistentRead=True)
        for item in data['Items']:
            indexContent = indexContent + '<br>' + '<a href="https://s3.amazonaws.com/' + self.constants["BUCKET"] + '/page' + item['PageID']['S'] + '">'+ item['Title']['S'] +'</a>'
        indexContent = indexContent + '<body></html>'
        print indexContent
        put_index_item_kwargs = {
            'Bucket': self.constants["BUCKET"],
            'ACL': 'public-read',
            'Body': indexContent,
            'Key': self.Index_file
        }
        print indexContent
        put_index_item_kwargs['ContentType'] = 'text/html'
        self.s3.put_object(**put_index_item_kwargs)


    def put_page_object(self, page_id, author, title, content, saved_date,
                        mDescription, mKeywords):
        page_key = 'page' + page_id
        
        self.update_index()

        put_blog_item_kwargs = {
            'Bucket': self.constants["BUCKET"],
            'ACL': 'public-read',
            'Body': '<head> <title>' + title + '</title>' +
            ' <meta name="description" content="' + mDescription+ '">'
            + '<meta name="keywords" content="' + mKeywords + '">' +
            '<meta http-equiv="content-type" content="text/html;charset=UTF-8">' +
            '</head><p>' + author + '<br>' + title + '<br>' +
            content + '<br>' + saved_date + '</p>',
            'Key': page_key
        }

        put_blog_item_kwargs['ContentType'] = 'text/html'
        self.s3.put_object(**put_blog_item_kwargs)


    def create_new_index(self):
        print "no index found ... creating Index"
        try:
            put_index_item_kwargs = {
                'Bucket': self.constants["BUCKET"],
                'ACL': 'public-read',
                'Body':'<h1>Index</h1> <br>',
                'Key': self.Index_file
            }
            put_index_item_kwargs['ContentType'] = 'text/html'
            self.s3.put_object(**put_index_item_kwargs)
        except botocore.exceptions.ClientError as e:
            print e.response['Error']['Code']
            response = Response("Error", None)
            response.errorMessage = "Unable to save new blog: %s" % e.response['Error']['Code']
