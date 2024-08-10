//? Import the functions needed from the firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


//? Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuciiCWxqoX_hywelDtxCfZGq7yLzdktk",
  authDomain: "my-project-c5480.firebaseapp.com",
  projectId: "my-project-c5480",
  storageBucket: "my-project-c5480.appspot.com",
  messagingSenderId: "814297864078",
  appId: "1:814297864078:web:63b450f8c7a8bbfd8736df",
  measurementId: "G-T6FNJC7RFC",
};


//? Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("App=>", app);


//? Initialize Firebase Authentication
const auth = getAuth(app);
console.log("auth=>", auth);


//? Initialize Cloud Firestore and get a reference to the database service
const db = getFirestore(app);
const body_div = document.getElementById("body_div");


//? Storing UIs/htmls in variables
let signup_html = `<div id="main_div">
    <p id="heading">SignUp</p>
    <input type="email" id="signup_email" placeholder="Email" autocomplete="off">
    <input type="password" id="signup_password" placeholder="Password">
    <button id="signup_btn">SignUp</button>
    <p id="prop"></p>
    <p id="redirect_signin">Already a user?<button id="signin_ui_btn">SignIn</button></p>
  </div>`;
let signin_html = `<p id="heading">SignIn</p>
    <input type="email" id="signin_email" placeholder="Email" autocomplete="off">
    <input type="password" id="signin_password" placeholder="Password">
    <button id="signin_btn">SignIn</button>`;
let todo_html = `<div id="main_div_todo">

        <h1 id="todo_head">To Do List</h1>

        <div id="todo_add_div">
            <input type="text" autocomplete="off" placeholder="Add New Task" id="todo_input">
            <button id="add_todo"><i class="fa-solid fa-plus fa-lg" style="color: #ee9ca7;"></i></button>
        </div>

        <div id="todos">
            <ul id="todo_ul">
            </ul>
        </div>

         <div id="logout_div">
        <button id="logout_btn">Logout<i class="fa-solid fa-right-from-bracket"></i></button>
    </div>

    </div>`;


//? Access DOM elements when UI changes from todolist UI to signup form UI
function access_form_elements(usecase) {
  //* usecase 1 accesses signup page elements and usecase 2 acesses signin page elements
  let main_div = document.getElementById("main_div");
  if (usecase === 1) {
    const signup_email = document.getElementById("signup_email");
    const signup_password = document.getElementById("signup_password");
    const signup_btn = document.getElementById("signup_btn");
    signup_btn.addEventListener("click", createUserAccount);
    const signin_ui_btn = document.getElementById("signin_ui_btn");
    signin_ui_btn.addEventListener("click", signin_ui);
  } else if (usecase === 2) {
    const signin_email = document.getElementById("signin_email");
    const signin_password = document.getElementById("signin_password");
    const signin_btn = document.getElementById("signin_btn");
    signin_btn.addEventListener("click", signin);
  }
}


//? Changes UI to signup UI
function signup_ui() {
  body_div.innerHTML = signup_html;
  access_form_elements(1);
}
//? Changes UI to signin UI
function signin_ui() {
  main_div.innerHTML = signin_html;
  access_form_elements(2);
}


//? Listener Function, keeps checking if the user is logged in/out
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in");
    //* Calling the function so that todos are automatically shown to the user
    //* without requiring a page refresh
    get_todos_from_db();
  } else {
    console.log("User logged out");
    signup_ui();
  }
});


//? Function to create new user account
function createUserAccount() {
  const auth = getAuth();
  createUserWithEmailAndPassword(
    auth,
    signup_email.value,
    signup_password.value
  )
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User Account Created");
      body_div.innerHTML = todo_html;
      add_default_todo();
      get_todos_from_db();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      //* Show errror popup
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `${errorCode.slice(5).toUpperCase()}`,
        footer: "Please enter valid credentials",
      });
    });
}


//? Function to sign user in if user already exists
function signin() {
  signInWithEmailAndPassword(auth, signin_email.value, signin_password.value)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User Signed In");
      body_div.innerHTML = todo_html;
      add_default_todo();
      get_todos_from_db();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      //* Show errror popup
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `${errorCode.slice(5).toUpperCase()}`,
        footer: "Please enter valid credentials",
      });
    });
}


//? Function to sign user out
function log_out() {
  signOut(auth)
    .then(() => {
      console.log("User LogOut Successful");
    })
    .catch((error) => {
      console.log("Error In User SignOut=>", error);
    });
}

//? ****************************** TodoList Code ******************************


//? Create a new collection in database
let todos_collection = collection(db, "todos");


//? Function to add a default todo if the collection is empty
async function add_default_todo() {
  try {
    const querySnapshot = await getDocs(todos_collection);
    if (querySnapshot.empty) {
      const default_todo = {
        todo: "Add Todos",
      };
      await addDoc(todos_collection, default_todo);
      console.log("Default Todo Added Due To Empty TodoList");
    }
    get_todos_from_db();
  } catch (e) {
    console.log(e);
    console.log("Failed To Add Default Todo");
  }
}
//? Call the function to automatically add a default todo
add_default_todo();


//? Function to add todos to DB
async function add_todo_to_db() {
  try {
    const obj = {
      todo: todo_input.value.trim(),
    };
    if (obj.todo === "") {
      Swal.fire({
        icon: "error",
        text: "Please enter a todo item.",
      });
      return;
    }

    const doc_ref = await addDoc(todos_collection, obj);
    console.log("Todo Added To DB =>");
    todo_input.value = "";
    get_todos_from_db();
  } catch (e) {
    console.log(e);
    console.log("Todo Addition Failed");
  }
}


//? Function to retreive/get todos from DB and show them on DOM
async function get_todos_from_db() {
  //* Access todolist DOM elements
  const todo_input = document.getElementById("todo_input");
  const todo_add_btn = document.getElementById("add_todo");
  const logout_btn = document.getElementById("logout_btn");
  const todo_list = document.getElementById("todo_ul");
  todo_add_btn.addEventListener("click", add_todo_to_db);
  logout_btn.addEventListener("click", signup_ui);

  try {
    const querySnapshot = await getDocs(todos_collection);
    console.log("Todos Retrieved From DB");
    

    //* Clear the current list from DOM to avoid duplicates
    todo_list.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const { todo } = doc.data();
      const todo_string = `<li id="${doc.id}" class="todo_done_btn"><button class="mark_as_done"></button><p id="p_todo">${todo}</p><button class="delete_todo_btn"><i class="fa-solid fa-trash fa-lg" style="color: #df1111;"></i></button></li>`;
      //* Add the todo_string to the DOM
      todo_list.innerHTML += todo_string;
    });

    //* Query for the delete buttons after the todos have been added to the DOM
    let delete_todo_btns = document.querySelectorAll(".delete_todo_btn");
    //* Add event listeners to the delete buttons
    delete_todo_btns.forEach((button) => {
      button.addEventListener("click", delete_todo);
    });
  } catch (e) {
    console.log(e);
  }

  //* Query to access todo paragraph elements and make an array of them to mark
  //* a specific todo as done.
  const p_array = document.querySelectorAll("#p_todo");
  const elements = [];
  p_array.forEach((ele, i) => {
    elements[i] = ele;
  });

  //* Query for the mark todo as_done buttons after the todos have been added to the DOM
  let mark_as_done_btns = document.querySelectorAll(".mark_as_done");
  let todo_done = false;
  //* Add event listeners to the delete buttons
  mark_as_done_btns.forEach((button, i) => {
    button.addEventListener("click", () => {
      if (todo_done == false) {
        button.style.backgroundImage = `url("./assets/check.svg")`;
        button.style.backgroundPosition = "center";
        button.style.backgroundSize = "cover";
        button.style.border = "0px";
        elements[i].style.textDecoration = "line-through";
        todo_done = true;
      } else {
        button.style.backgroundImage = "none";
        button.style.border = "2px solid white";
        elements[i].style.textDecoration = "none";
        todo_done = false;
      }
    });
  });
}


//? Function to delete todos from DB and also remove them from DOM
async function delete_todo(event) {
  try {
    //* Retrieve the document ID from the parent li element
    const doc_id = event.currentTarget.parentElement.id;
    const doc_ref = doc(db, "todos", doc_id);
    await deleteDoc(doc_ref);
    console.log("Todo Deleted From DB");
    add_default_todo();
  } catch (e) {
    console.log(e);
  }
}
