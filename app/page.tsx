"use client";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  addList,
  deleteList,
  addTask,
  toggleTask,
  deleteTask,
} from "./actions";
import { toast, Toaster } from "sonner";

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
  const [lists, setLists] = useState<TodoList[]>([]);
  const [activeList, setActiveList] = useState("");
  const [newListTitle, setNewListTitle] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const addNewList = async () => {
    if (newListTitle.trim() === "") return;
    const currentActiveList = activeList;
    const newList = {
      id: uuidv4(),
      title: newListTitle.trim(),
      tasks: [],
    };

    // Update local state immediately for optimistic UI
    setLists((prevLists) => [newList, ...prevLists]);
    setActiveList(newList.id);
    setNewListTitle("");

    try {
      // Update in database
      const res = await addList(newList);
      // If the operation failed, revert the optimistic update
      if (!res?.success) {
        setLists((prevLists) =>
          prevLists.filter((list) => list.id !== newList.id)
        );
        // Set active list to previous one if it existed
        if (lists.length > 0) {
          setActiveList(currentActiveList);
        }
      }
    } catch (error) {
      console.log(error);
      toast("mess", { description: "asdzf" });
      setInterval(() => {}, 2000);
      setLists((prevLists) =>
        prevLists.filter((list) => list.id !== newList.id)
      );
      // Set active list to previous one if it existed
      if (lists.length > 0) {
        setActiveList(currentActiveList);
      }
    }
  };

  const addNewTask = async () => {
    if (newTaskText.trim() === "" || !activeList) return;

    const taskText = newTaskText.trim();
    const newTask = {
      id: uuidv4(),
      text: taskText,
      completed: false,
    };

    // Update local state immediately for optimistic UI
    setLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === activeList) {
          return {
            ...list,
            tasks: [newTask, ...list.tasks],
          };
        }
        return list;
      })
    );
    setNewTaskText("");
    try {
      // Update in database

      const res = await addTask(activeList, taskText);
      // If the operation failed, revert the optimistic update
      if (!res?.success) {
        setLists((prevLists) =>
          prevLists.map((list) => {
            if (list.id === activeList) {
              return {
                ...list,
                tasks: list.tasks.filter((task) => task.id !== newTask.id),
              };
            }
            return list;
          })
        );
      }
    } catch (error) {
      console.log(error);
      toast("mess", { description: "asdzf" });
      setInterval(() => {}, 4000);
      setLists((prevLists) =>
        prevLists.map((list) => {
          if (list.id === activeList) {
            return {
              ...list,
              tasks: list.tasks.filter((task) => task.id !== newTask.id),
            };
          }
          return list;
        })
      );
    }
  };

  const handleToggleTask = async (listId: string, taskId: string) => {
    // Update local state immediately for optimistic UI
    setLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            tasks: list.tasks.map((task) => {
              if (task.id === taskId) {
                return { ...task, completed: !task.completed };
              }
              return task;
            }),
          };
        }
        return list;
      })
    );
    try {
      const res = await toggleTask(listId, taskId);
      // If the operation failed, revert the optimistic update
      if (!res?.success) {
        setLists((prevLists) =>
          prevLists.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                tasks: list.tasks.map((task) => {
                  if (task.id === taskId) {
                    return { ...task, completed: !task.completed };
                  }
                  return task;
                }),
              };
            }
            return list;
          })
        );
      }
    } catch (error) {
      console.log(error);
      toast("mess", { description: "asdzf" });
      setInterval(() => {}, 4000);
      setLists((prevLists) =>
        prevLists.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              tasks: list.tasks.map((task) => {
                if (task.id === taskId) {
                  return { ...task, completed: !task.completed };
                }
                return task;
              }),
            };
          }
          return list;
        })
      );
    }
    // Update in database
  };

  const handleDeleteTask = async (listId: string, taskId: string) => {
    // Store the task for potential recovery
    const taskToDelete = lists
      .find((list) => list.id === listId)
      ?.tasks.find((task) => task.id === taskId);

    // Update local state immediately for optimistic UI
    setLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            tasks: list.tasks.filter((task) => task.id !== taskId),
          };
        }
        return list;
      })
    );
    try {
      // Update in database
      const res = await deleteTask(listId, taskId);
      // If the operation failed, revert the optimistic update
      if (!res?.success && taskToDelete) {
        setLists((prevLists) =>
          prevLists.map((list) => {
            if (list.id === listId) {
              return {
                ...list,
                tasks: [...list.tasks, taskToDelete],
              };
            }
            return list;
          })
        );
      }
    } catch (error) {
      console.log(error);
      toast("mess", { description: "asdzf" });
      setInterval(() => {}, 4000);
      setLists((prevLists) =>
        prevLists.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              tasks: [...list.tasks, taskToDelete!],
            };
          }
          return list;
        })
      );
    }
  };

  const handleDeleteList = async (listId: string) => {
    // Store the list for potential recovery
    const listToDelete = lists.find((list) => list.id === listId);

    // Update local state immediately for optimistic UI
    setLists((prevLists) => prevLists.filter((list) => list.id !== listId));

    // If we're deleting the active list, select a new one
    if (listId === activeList) {
      const remainingLists = lists.filter((list) => list.id !== listId);
      if (remainingLists.length > 0) {
        setActiveList(remainingLists[0].id);
      } else {
        setActiveList("");
      }
    }

    // Update in database
    try {
      const res = await deleteList(listId);
      // If the operation failed, revert the optimistic update
      if (!res?.success && listToDelete) {
        setLists((prevLists) => [...prevLists, listToDelete]);

        // Restore active list if needed
        if (listId === activeList) {
          setActiveList(listId);
        }
      }
    } catch (error) {
      console.log(error);
      toast("mess", { description: "asdzf" });
      setInterval(() => {}, 4000);
      setLists((prevLists) => [...prevLists, listToDelete!]);
    }
  };

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/lists");

      const fetchedLists = await res.json();
      setLists(fetchedLists);

      if (
        fetchedLists.length > 0 &&
        (!activeList || !fetchedLists.some((list) => list.id === activeList))
      ) {
        setActiveList(fetchedLists[0].id);
      } else if (fetchedLists.length === 0) {
        setActiveList("");
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Todo App</h1>

      {isLoading ? (
        <div className="text-center py-8">Loading your lists...</div>
      ) : (
        <Tabs
          value={activeList}
          onValueChange={setActiveList}
          className="w-full"
        >
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

                  {lists.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No lists yet. Create one above!
                    </p>
                  ) : (
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteList(list.id);
                            }}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </TabsList>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              {lists.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <p className="text-center text-muted-foreground">
                      Create a list to get started!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                lists.map((list) => (
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
                          {!list.tasks || list.tasks.length === 0 ? (
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
                                      handleToggleTask(list.id, task.id)
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
                                  onClick={() =>
                                    handleDeleteTask(list.id, task.id)
                                  }
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
                ))
              )}
            </div>
          </div>
        </Tabs>
      )}
      <Toaster />
    </div>
  );
}
