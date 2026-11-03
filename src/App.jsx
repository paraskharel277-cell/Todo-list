import React, { useState, useEffect } from "react";
import "./index.css";

// Todo Item Component supporting Edit, Toggle, Delete, and displaying Location
function Todo(props) {
  const [isEditing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  function handleChange(e) {
    setNewName(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    props.editTask(props.id, newName);
    setNewName("");
    setEditing(false);
  }

  const editingTemplate = (
    <form className="stack-small" onSubmit={handleSubmit}>
      <div className="c-cb">
        <label className="todo-label" htmlFor={props.id}>
          New name for {props.name}
        </label>
        <input
          id={props.id}
          className="todo-text"
          type="text"
          value={newName || props.name}
          onChange={handleChange}
          autoFocus
        />
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn"
          onClick={() => setEditing(false)}
        >
          Cancel <span className="visually-hidden">renaming {props.name}</span>
        </button>
        <button type="submit" className="btn btn__primary">
          Save <span className="visually-hidden">new name for {props.name}</span>
        </button>
      </div>
    </form>
  );

  const viewTemplate = (
    <div className="stack-small">
      <div className="c-cb">
        <input
          id={props.id}
          type="checkbox"
          defaultChecked={props.completed}
          onChange={() => props.toggleTaskCompleted(props.id)}
        />
        {/* Displays: Tokyo | la 35.689487 | lo 139.691706 */}
        <label className="todo-label" htmlFor={props.id}>
          {props.name}
          {props.location &&
            ` | la ${props.location.latitude} | lo ${props.location.longitude}`}
        </label>
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn"
          onClick={() => setEditing(true)}
        >
          Edit <span className="visually-hidden">{props.name}</span>
        </button>
        <button
          type="button"
          className="btn btn__danger"
          onClick={() => props.deleteTask(props.id)}
        >
          Delete <span className="visually-hidden">{props.name}</span>
        </button>
      </div>
    </div>
  );

  return (
    <li className="todo stack-small">
      {isEditing ? editingTemplate : viewTemplate}
    </li>
  );
}

// Filter configuration map
const FILTER_MAP = {
  All: () => true,
  Active: (task) => !task.completed,
  Completed: (task) => task.completed,
};
const FILTER_NAMES = Object.keys(FILTER_MAP);

function App(props) {
  // Initialize state from LocalStorage if available, otherwise use default tasks
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
    return [
      {
        id: "todo-0",
        name: "Eat",
        completed: true,
        location: { latitude: "##", longitude: "##", error: "" },
      },
      {
        id: "todo-1",
        name: "Sleep",
        completed: false,
        location: { latitude: "##", longitude: "##", error: "" },
      },
      {
        id: "todo-2",
        name: "Repeat",
        completed: false,
        location: { latitude: "##", longitude: "##", error: "" },
      },
    ];
  });

  const [filter, setFilter] = useState("All");
  const [name, setName] = useState("");

  // Sync tasks to LocalStorage whenever tasks state changes
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Helper function to update a task's location in state & localStorage
  function locateTask(id, location) {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (id === task.id) {
          return { ...task, location: location };
        }
        return task;
      })
    );
  }

  // Lecturer's Geolocation API pattern from Slide 14 (geoFindMe + success + error)
  const geoFindMe = (taskId) => {
    // Green Box on Slide 14: Success Callback Function
    const success = (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      locateTask(taskId, {
        latitude: latitude,
        longitude: longitude,
        error: "",
      });
    };

    // Red Box on Slide 14: Error Callback Function
    const error = () => {
      console.log("Unable to retrieve your location");
      locateTask(taskId, {
        latitude: "##",
        longitude: "##",
        error: "Unable to retrieve your location",
      });
    };

    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser");
    } else {
      console.log("Locating...");
      navigator.geolocation.getCurrentPosition(success, error);
    }
  };

  // Add a new task with initial "##" location, then call geoFindMe()
  function addTask(name) {
    const id = `todo-${Date.now()}`;
    const newTask = {
      id: id,
      name: name,
      completed: false,
      location: { latitude: "##", longitude: "##", error: "" },
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    geoFindMe(id);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    addTask(name);
    setName("");
  }

  function toggleTaskCompleted(id) {
    const updatedTasks = tasks.map((task) => {
      if (id === task.id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  }

  function deleteTask(id) {
    const remainingTasks = tasks.filter((task) => id !== task.id);
    setTasks(remainingTasks);
  }

  function editTask(id, newName) {
    const editedTaskList = tasks.map((task) => {
      if (id === task.id) {
        return { ...task, name: newName };
      }
      return task;
    });
    setTasks(editedTaskList);
  }

  const taskList = tasks
    .filter(FILTER_MAP[filter])
    .map((task) => (
      <Todo
        id={task.id}
        name={task.name}
        completed={task.completed}
        location={task.location}
        key={task.id}
        toggleTaskCompleted={toggleTaskCompleted}
        deleteTask={deleteTask}
        editTask={editTask}
      />
    ));

  const filterList = FILTER_NAMES.map((name) => (
    <button
      key={name}
      type="button"
      className="btn toggle-btn"
      aria-pressed={filter === name}
      onClick={() => setFilter(name)}
    >
      <span className="visually-hidden">Show </span>
      <span>{name}</span>
      <span className="visually-hidden"> tasks</span>
    </button>
  ));

  const itemsNoun =
    tasks.filter(FILTER_MAP["Active"]).length !== 1 ? "tasks" : "task";
  const remainingText = `${tasks.filter(FILTER_MAP["Active"]).length} ${itemsNoun} remaining`;

  return (
    <div className="todoapp stack-large">
      <h1>TodoMatic</h1>
      <form onSubmit={handleSubmit}>
        <h2 className="label-wrapper">
          <label htmlFor="new-todo-input" className="label__lg">
            What needs to be done?
          </label>
        </h2>
        <input
          type="text"
          id="new-todo-input"
          className="input input__lg"
          name="text"
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn__primary btn__lg">
          Add
        </button>
      </form>

      <div className="filters btn-group stack-exception">{filterList}</div>

      <h2 id="list-heading">{remainingText}</h2>

      <ul
        role="list"
        className="todo-list stack-large stack-exception"
        aria-labelledby="list-heading"
      >
        {taskList}
      </ul>
    </div>
  );
}

export default App;