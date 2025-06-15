import { useEffect, useState } from 'react'
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { BsCheckLg } from "react-icons/bs";
import './App.css'

function App() {
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [allTodos, setAllTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [completedTodos, setCompletedTodos] = useState([]);
  const [currentEdit, setCurrentEdit] = useState("");
  const [currentEditedItem, setCurrentEditedItem] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [error, setError] = useState('');

  // Enhanced validation for adding todos
  function handleAddTodo() {
    if (!newTitle.trim()) {
      setError('Title is required');
      return;
    }
    
    setError('');
    
    let newTodoItem = {
      title: newTitle,
      description: newDescription,
      createdAt: new Date().toISOString(),
      completed: false
    }

    let updatedTodoArr = [...allTodos, newTodoItem];
    setAllTodos(updatedTodoArr);
    setNewTitle("");
    setNewDescription("");
    saveToLocalStorage('todolist', updatedTodoArr);
  }

  // Enhanced localStorage handling
  function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function handleDeleteTodo(index) {
    let reducedTodo = [...allTodos];
    reducedTodo.splice(index, 1);
    setAllTodos(reducedTodo);
    saveToLocalStorage('todolist', reducedTodo);
  }

  // Improved completion handling
  function handleCompleteTodo(index) {
    const now = new Date();
    const completedOn = now.toLocaleString();
    
    let filteredItem = {
      ...allTodos[index],
      completedOn: completedOn,
      completed: true
    }

    let updatedCompletedArr = [...completedTodos, filteredItem];
    setCompletedTodos(updatedCompletedArr);
    handleDeleteTodo(index);
    saveToLocalStorage('completedTodos', updatedCompletedArr);
  }

  function handleDeleteCompletedTodo(index) {
    let reducedTodo = [...completedTodos];
    reducedTodo.splice(index, 1);
    setCompletedTodos(reducedTodo);
    saveToLocalStorage('completedTodos', reducedTodo);
  }

  // Edit functions remain the same
  function handleEdit(index, item) {
    setCurrentEdit(index);
    setCurrentEditedItem(item);
  }

  function handleUpdateTitle(value) {
    setCurrentEditedItem((prev) => {
      return { ...prev, title: value }
    })
  }

  function handleUpdateDescription(value) {
    setCurrentEditedItem((prev) => {
      return { ...prev, description: value }
    })
  }

  function handleUpdateTodo() {
    let newTodo = [...allTodos];
    newTodo[currentEdit] = currentEditedItem;
    setAllTodos(newTodo);
    setCurrentEdit("");
    saveToLocalStorage('todolist', newTodo);
  }

  // Sorting functionality
  const getSortedTodos = (todos) => {
    return [...todos].sort((a, b) => {
      if (sortOption === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOption === 'alphabetical') return a.title.localeCompare(b.title);
      return 0;
    });
  };

  
   const sortedActiveTodos = getSortedTodos(allTodos);
  const sortedCompletedTodos = getSortedTodos(completedTodos);

  useEffect(() => {
    let savedTodo = JSON.parse(localStorage.getItem('todolist'));
    let savedCompletedTodo = JSON.parse(localStorage.getItem('completedTodos'));
    if (savedTodo) {
      setAllTodos(savedTodo);
    }
    if (savedCompletedTodo) {
      setCompletedTodos(savedCompletedTodo);
    }
  }, [])

  return (
    <div className='App'>
      <h1>My Todos</h1>

      <div className='todo-wrapper'>
        <div className='todo-input'>
          <div className='todo-input-item'>
            <label htmlFor="title">Title*</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              id='title'
              type="text"
              placeholder='Provide Title'
              required
            />
            {error && <p className="error-message">{error}</p>}
          </div>
          <div className='todo-input-item'>
            <label htmlFor="desc">Description</label>
            <input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              id='desc'
              type="text"
              placeholder='Provide Description'
            />
          </div>
          <div className='todo-input-item'>
            <button onClick={handleAddTodo} type='button' className='primaryBtn'>Add</button>
          </div>
        </div>

        <div className='controls'>
          <div className='btn-area'>
            <button
              className={`secondaryBtn ${isCompleteScreen === false && 'active'}`}
              onClick={() => setIsCompleteScreen(false)}
            >
              Todo ({allTodos.length})
            </button>
            <button
              className={`secondaryBtn ${isCompleteScreen === true && 'active'}`}
              onClick={() => setIsCompleteScreen(true)}
            >
              Completed ({completedTodos.length})
            </button>
          </div>

          {!isCompleteScreen && (
            <div className='sort-controls'>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className='sort-select'
              >
                <option value="newest" className='option'>Newest First</option>
                <option value="oldest" className='option'>Oldest First</option>
                <option value="alphabetical" className='option'>A-Z</option>
              </select>
            </div>
          )}
        </div>

        <div className='todo-list'>
          {isCompleteScreen === false ? (
            sortedActiveTodos.length > 0 ? (
              sortedActiveTodos.map((item, index) => {
                if (currentEdit === index) {
                  return (
                    <div className='edit_wrapper' key={index}>
                      <input
                        onChange={(e) => handleUpdateTitle(e.target.value)}
                        type="text"
                        placeholder='Updated Title'
                        value={currentEditedItem.title}
                      />
                      <textarea
                        onChange={(e) => handleUpdateDescription(e.target.value)}
                        type="text"
                        placeholder='Updated Description'
                        rows={4}
                        value={currentEditedItem.description}
                      />
                      <button
                        onClick={handleUpdateTodo}
                        type='button'
                        className='primaryBtn'
                      >
                        Update
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className={`todo-list-item ${item.completed ? 'completed' : ''}`} key={index}>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        {item.createdAt && (
                          <small>Created: {new Date(item.createdAt).toLocaleString()}</small>
                        )}
                      </div>
                      <div>
                        <AiOutlineDelete
                          onClick={() => handleDeleteTodo(index)}
                          className='del-icon'
                          title='Delete?'
                        />
                        <BsCheckLg
                          onClick={() => handleCompleteTodo(index)}
                          className='check-icon'
                          title='Complete?'
                        />
                        <AiOutlineEdit
                          onClick={() => handleEdit(index, item)}
                          className='edit-icon'
                          title='Edit?'
                        />
                      </div>
                    </div>
                  );
                }
              })
            ) : (
              <p className='no-tasks'>No tasks found</p>
            )
          ) : (
            sortedCompletedTodos.length > 0 ? (
              sortedCompletedTodos.map((item, index) => {
                return (
                  <div className='todo-list-item completed' key={index}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <p><small>Completed on: {item.completedOn}</small></p>
                    </div>
                    <div>
                      <AiOutlineDelete
                        onClick={() => handleDeleteCompletedTodo(index)}
                        className='del-icon'
                        title='Delete?'
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className='no-tasks'>No completed tasks</p>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default App