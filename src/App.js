import "./App.css";
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from "./firebase.config";
import { useState } from "react";

firebase.initializeApp(firebaseConfig);

function App() {
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(googleProvider)
      .then((result) => {
        const { displayName, email, photoURL } = result.user;
        const signedInUser = {
          isSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL,
        };
        setUser(signedInUser);
        // console.log(displayName, email, phoneNumber, photoURL);
      })
      .catch((error) => {
        console.log(error);
        console.log(error.message);
      });
  };
  const handleFbSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;
        console.log("Fb User", user);
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        // ...
      });
  };
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignIn: false,
    name: "",
    email: "",
    password: "",
    photo: "",
    error: "",
    success: false,
  });
  const handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then((res) => {
        const signedOutUser = {
          isSignIn: false,
          name: "",
          email: "",
          photo: "",
        };
        setUser(signedOutUser);
      });
  };
  const handleBlur = (event) => {
    // console.log(event.target.name, event.target.value);
    //Email Validation>
    let isFormValid = true;
    if (event.target.name === "email") {
      isFormValid = /\S+@\S+\.\S+/.test(event.target.value);
    }
    if (event.target.name === "password") {
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(event.target.value);
      isFormValid = isPasswordValid && passwordHasNumber;
    }
    if (isFormValid) {
      const newUserInfo = { ...user };
      newUserInfo[event.target.name] = event.target.value;
      setUser(newUserInfo);
    }
  };
  const handleSubmit = (evnt) => {
    if (newUser && user.email && user.password) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then((userCredential) => {
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
          updateUserName(user.name);
        });
    }
    if (!newUser && user.email && user.password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((userCredential) => {
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log("Sign In User Info:", userCredential);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    evnt.preventDefault();
  };

  const updateUserName = (name) => {
    const user = firebase.auth().currentUser;

    user
      .updateProfile({
        displayName: name,
      })
      .then(() => {
        console.log("User Name Updated Successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="App">
      <h2>Hello React</h2>
      {user.isSignIn ? (
        <button onClick={handleSignOut}>Sign Out</button>
      ) : (
        <button onClick={handleSignIn}>Google Sign in</button>
      )}
      {user.isSignIn && (
        <div>
          <p>Welcome: {user.name}</p>
          <p>Your Emial: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      )}
      <br />
      <br />
      {/* FaceBook_Login */}
      <button onClick={handleFbSignIn}>Facebook Login</button>

      <h2>Our Own Authentication</h2>
      <br />
      <form onSubmit={handleSubmit}>
        <input
          type="checkbox"
          name="newUser"
          id=""
          onChange={() => setNewUser(!newUser)}
        />
        <label htmlFor="newUser">New User Sign Up</label>
        <br />
        {newUser && (
          <input type="text" name="name" placeholder="Enter Full Name" />
        )}
        <br />
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          required
          onBlur={handleBlur}
        />
        <br />
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          required
          onBlur={handleBlur}
        />
        <br />
        <input type="submit" value={newUser ? "Sign Up" : "Sign In"} />
      </form>
      <p style={{ color: "red" }}>
        {" "}
        <strong>{user.error}</strong>{" "}
      </p>
      {user.success && (
        <p style={{ color: "green" }}>
          {" "}
          <strong>
            Succesfully {newUser ? "Created" : "Logged In"} Your Acoutn
          </strong>{" "}
        </p>
      )}
    </div>
  );
}

export default App;
