"use server";
import { db } from "@/lib/dynamodb";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = "mytable";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}
interface TodoList {
  id: string;
  title: string;
  pending?: boolean;
  tasks: Task[];
}

export async function addList(todo: TodoList) {
  try {
    const id = `list-${Date.now()}`;
    const createdAt = new Date().toISOString(); // ISO string format for easy sorting

    await db.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...todo, createdAt: Date.now() },
      })
    );
    return { success: true, id, createdAt };
  } catch (error) {
    return { success: false, err: error };
  }
}

export async function addTask(listId: string, text: string) {
  const task = { id: uuidv4(), text, completed: false };
  try {
    await db.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: listId },
        UpdateExpression: "SET tasks = list_append(tasks, :task)",
        ExpressionAttributeValues: { ":task": [task] },
      })
    );
    return { success: true };
  } catch (error) {
    return { success: false, err: error };
  }
}

export async function toggleTask(listId: string, taskId: string) {
  try {
    const { Item } = await db.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { id: listId } })
    );
    if (!Item) return;

    const tasks = (Item.tasks as Task[]).map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    await db.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: listId },
        UpdateExpression: "SET tasks = :tasks",
        ExpressionAttributeValues: { ":tasks": tasks },
      })
    );
    return { success: true };
  } catch (error) {
    return { success: false, err: error };
  }
}

export async function deleteTask(listId: string, taskId: string) {
  try {
    const { Item } = await db.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { id: listId } })
    );
    if (!Item) return;

    const tasks = (Item.tasks as Task[]).filter((t) => t.id !== taskId);

    await db.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: listId },
        UpdateExpression: "SET tasks = :tasks",
        ExpressionAttributeValues: { ":tasks": tasks },
      })
    );
    return { success: true };
  } catch (error) {
    return { success: false, err: error };
  }
}

export async function deleteList(listId: string) {
  try {
    await db.send(
      new DeleteCommand({ TableName: TABLE_NAME, Key: { id: listId } })
    );
    return { success: true };
  } catch (error) {
    return { success: false, err: error };
  }
}
