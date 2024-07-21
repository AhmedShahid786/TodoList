// Import the functions needed from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

//Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuciiCWxqoX_hywelDtxCfZGq7yLzdktk",
  authDomain: "my-project-c5480.firebaseapp.com",
  projectId: "my-project-c5480",
  storageBucket: "my-project-c5480.appspot.com",
  messagingSenderId: "814297864078",
  appId: "1:814297864078:web:63b450f8c7a8bbfd8736df",
  measurementId: "G-T6FNJC7RFC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
console.log("App=>", app);
// Initialize Firebase Authentication
const auth = getAuth(app);
console.log("auth=>", auth);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const body_div = document.getElementById("body_div");
//Storing htmls in variables
let signup_html = `<div id="main_div">
    <p id="heading">SignUp</p>
    <input type="email" id="signup_email" placeholder="Email" autocomplete="off">
    <input type="password" id="signup_password" placeholder="Password">
    <button id="signup_btn">SignUp</button>
    <p id="prop"></p>
    <p id="redirect_signin">Already a user?<button id="signin_ui_btn">SignIn</button></p>
  </div>`;
let signin_html = `<p id="heading">SignUp</p>
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

    </div>`;

function access_form_elements(usecase) {
  // Accessing Html Elements
  let main_div = document.getElementById("main_div");
  if (usecase === 1) {
    let signup_email = document.getElementById("signup_email");
    let signup_password = document.getElementById("signup_password");
    let signup_btn = document.getElementById("signup_btn");
    signup_btn.addEventListener("click", createUserAccount);
    let signin_ui_btn = document.getElementById("signin_ui_btn");
    signin_ui_btn.addEventListener("click", signin_ui);
  } else if (usecase === 2) {
    let signin_email = document.getElementById("signin_email");
    let signin_password = document.getElementById("signin_password");
    let signin_btn = document.getElementById("signin_btn");
    signin_btn.addEventListener("click", signin);
  }
}

const todo_input = document.getElementById("todo_input");
const todo_add_btn = document.getElementById("add_todo");
todo_add_btn.addEventListener("click", add_todo_to_db);
const todo_list = document.getElementById("todo_ul");

// Listener Function
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in");
    const uid = user.uid;
  } else {
    console.log("User logged out");
    body_div.innerHTML = signup_html;
    access_form_elements(1);
  }
});

// Function to create new user account
function createUserAccount() {
  // console.log("email=>", signup_email.value);
  // console.log("password=>", signup_password.value);
  console.log("working");
  const auth = getAuth();
  createUserWithEmailAndPassword(
    auth,
    signup_email.value,
    signup_password.value
  )
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      console.log("User=>", user);
      body_div.innerHTML = todo_html;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
    });
}

function signin() {
  signInWithEmailAndPassword(auth, signin_email.value, signin_password.value)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("User Signed In");
      body_div.innerHTML = todo_html;
      access_todolist_elements();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
    });
}
function signin_ui() {
  main_div.innerHTML = signin_html;
  access_form_elements(2);
}

let todos_collection = collection(db, "todos");

// Function to add a default todo if the collection is empty
async function add_default_todo() {
  try {
    const querySnapshot = await getDocs(todos_collection);
    if (querySnapshot.empty) {
      const default_todo = {
        todo: "Add Todos",
        date: new Date().toLocaleDateString(),
      };
      await addDoc(todos_collection, default_todo);
    }
    get_todos_from_db(); // Ensure the todos are fetched and event listeners are applied
  } catch (e) {
    console.log(e);
    console.log("Failed to add default todo");
  }
}

async function add_todo_to_db() {
  try {
    console.log("pass");
    const obj = {
      todo: todo_input.value.trim(),
      date: new Date().toLocaleDateString(),
    };
    if (obj.todo === "") {
      console.log("Please enter a todo item.");
      return;
    }

    const doc_ref = await addDoc(todos_collection, obj);
    console.log("Todo Added To DB =>", doc_ref);
    todo_input.value = "";
    get_todos_from_db(); // Move this after clearing the input
  } catch (e) {
    console.log(e); // Fixed typo
    console.log("Todo Addition Failed");
  }
}

async function get_todos_from_db() {
  try {
    const querySnapshot = await getDocs(todos_collection);
    console.log("Todos Retrieved From DB");

    // Clear the current list to avoid duplicates
    todo_list.innerHTML = "";

    if (querySnapshot.todo === "") {
      console.log("Enter A Todo");
      return;
    }
    querySnapshot.forEach((doc) => {
      const { todo, date } = doc.data();
      const todo_string = `<li id="${doc.id}" class="todo_done_btn"><button class="mark_as_done"></button><p>${todo}</p><button class="delete_todo_btn"><i class="fa-solid fa-trash fa-lg" style="color: #df1111;"></i></button></li>`;
      // Add the todo_string to the DOM
      todo_list.innerHTML += todo_string;
    });

    // Query for the delete buttons after the todos have been added to the DOM
    let delete_todo_btns = document.querySelectorAll(".delete_todo_btn");
    console.log(delete_todo_btns);

    // Add event listeners to the delete buttons
    delete_todo_btns.forEach((button) => {
      button.addEventListener("click", delete_todo);
    });
  } catch (e) {
    console.log(e);
  }
}

async function delete_todo(event) {
  try {
    // Retrieve the document ID from the parent li element
    const doc_id = event.currentTarget.parentElement.id;
    const doc_ref = doc(db, "todos", doc_id);
    await deleteDoc(doc_ref);
    add_default_todo();
    get_todos_from_db();
  } catch (e) {
    console.log(e);
  }
}

// Call the function to add a default todo if the collection is empty
add_default_todo();
