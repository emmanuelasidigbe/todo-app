import { NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { dynamoDBClient } from "@/lib/dynamodb";

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: "mytable",
    });

    const { Items } = await dynamoDBClient.send(command);

    // Convert DynamoDB response to a readable format
    const lists =
      Items?.map((item) => ({
        id: item.id.S,
        title: item.title?.S,
        createdAt: item.createdAt?.N?.toString() ?? item.createdAt?.S ?? "", // Handle number or string format
        tasks:
          item.tasks?.L?.map((t) => ({
            id: t.M?.id?.S,
            text: t.M?.text?.S, // Changed from 'name' to 'text' to match your frontend
            completed: t.M?.completed?.BOOL || false,
          })) || [],
      })) || [];

    console.log("Parsed lists:", JSON.stringify(lists, null, 2));

    // Sort by createdAt in descending order (newest first)
    const sortedLists = lists.sort((a, b) => {
      // Handle case where createdAt might be missing
      if (!a.createdAt) return 1; // Items without timestamp go to the end
      if (!b.createdAt) return -1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return NextResponse.json(sortedLists);
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching lists" },
      { status: 500 }
    );
  }
}
