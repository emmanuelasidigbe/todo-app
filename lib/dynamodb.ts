import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const dynamoDBClient = new DynamoDBClient({ region: "us-central-1" });
export const db = DynamoDBDocumentClient.from(dynamoDBClient);
