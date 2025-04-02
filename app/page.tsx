"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoList {
  id: string;
  title: string;
  tasks: Task[];
}

export default function TodoApp() {
  const [lists, setLists] = useState<TodoList[]>([
    {
      id: "default",
      title: "My Tasks",
      tasks: [
        { id: "task-1", text: "Learn React", completed: false },
        { id: "task-2", text: "Build a todo app", completed: false },
      ],
    },
  ]);
  const [activeList, setActiveList] = useState("default");
  const [newListTitle, setNewListTitle] = useState("");
  const [newTaskText, setNewTaskText] = useState("");

  const addNewList = () => {
    if (newListTitle.trim() === "") return;

    const newList: TodoList = {
      id: `list-${Date.now()}`,
      title: newListTitle,
      tasks: [],
    };

    setLists([...lists, newList]);
    setNewListTitle("");
    setActiveList(newList.id);
  };

  const addNewTask = () => {
    if (newTaskText.trim() === "") return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: newTaskText,
      completed: false,
    };

    setLists(
      lists.map((list) => {
        if (list.id === activeList) {
          return {
            ...list,
            tasks: [...list.tasks, newTask],
          };
        }
        return list;
      })
    );

    setNewTaskText("");
  };

  const toggleTaskCompletion = (listId: string, taskId: string) => {
    setLists(
      lists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            tasks: list.tasks.map((task) => {
              if (task.id === taskId) {
                return {
                  ...task,
                  completed: !task.completed,
                };
              }
              return task;
            }),
          };
        }
        return list;
      })
    );
  };

  const deleteTask = (listId: string, taskId: string) => {
    setLists(
      lists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            tasks: list.tasks.filter((task) => task.id !== taskId),
          };
        }
        return list;
      })
    );
  };

  const deleteList = (listId: string) => {
    const updatedLists = lists.filter((list) => list.id !== listId);
    setLists(updatedLists);

    // If we deleted the active list, set the first list as active
    if (listId === activeList && updatedLists.length > 0) {
      setActiveList(updatedLists[0].id);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">
        Multi-List Todo App
      </h1>

      <Tabs value={activeList} onValueChange={setActiveList} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>My Lists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex mb-4">
                  <Input
                    placeholder="New list name"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addNewList();
                    }}
                    className="mr-2"
                  />
                  <Button onClick={addNewList} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <TabsList className="flex flex-col h-auto items-stretch">
                  {lists.map((list) => (
                    <div key={list.id} className="flex items-center">
                      <TabsTrigger
                        value={list.id}
                        className="flex-grow text-left justify-start"
                      >
                        {list.title} (
                        {list.tasks.filter((t) => !t.completed).length})
                      </TabsTrigger>
                      {lists.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteList(list.id);
                          }}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </TabsList>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            {lists.map((list) => (
              <TabsContent key={list.id} value={list.id} className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>{list.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex mb-4">
                      <Input
                        placeholder="Add a new task"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addNewTask();
                        }}
                        className="mr-2"
                      />
                      <Button onClick={addNewTask} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {list.tasks.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          No tasks yet. Add one above!
                        </p>
                      ) : (
                        list.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`${list.id}-${task.id}`}
                                checked={task.completed}
                                onCheckedChange={() =>
                                  toggleTaskCompletion(list.id, task.id)
                                }
                              />
                              <label
                                htmlFor={`${list.id}-${task.id}`}
                                className={`font-medium ${
                                  task.completed
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {task.text}
                              </label>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTask(list.id, task.id)}
                              className="h-8 w-8 opacity-50 hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
