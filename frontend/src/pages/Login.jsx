
import { useState } from "react"
import { login } from "../services/api"

export default function Login({ onLogin, onShowRegister }) {

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)


  async function handleSubmit(){

    if(!email || !password){
      setError("Please enter both email and password")
      return
    }

    setLoading(true)
    setError("")


    try{

      const res = await login(email,password)

      const userData = {
        token: res.data.access_token,
        refresh_token: res.data.refresh_token,
        username: res.data.username,
        role: res.data.role
      }


      localStorage.setItem(
        "token",
        userData.token
      )

      localStorage.setItem(
        "refresh_token",
        userData.refresh_token
      )

      localStorage.setItem(
        "username",
        userData.username
      )

      localStorage.setItem(
        "role",
        userData.role
      )


      onLogin(userData)


    }catch(error){

      console.log(error)

      setError(
        "Invalid email or password. Please try again."
      )

    }finally{

      setLoading(false)

    }

  }



return (

<main className="min-h-screen bg-gradient-to-br from-teal-600 to-blue-800 flex items-center justify-center p-4">


<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">


<div className="text-center mb-8">

<div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">

<span className="text-white text-2xl font-bold">
TC
</span>

</div>


<h1 className="text-2xl font-bold text-gray-800">
Taifa Care HMIS
</h1>


<p className="text-gray-500 mt-1">
Sign in to access knowledge system
</p>


</div>



{error && (

<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">

{error}

</div>

)}



<div className="space-y-4">


<input
type="email"
value={email}
onChange={e=>setEmail(e.target.value)}
placeholder="Email address"
className="w-full border rounded-lg px-4 py-3"
/>


<input
type="password"
value={password}
onChange={e=>setPassword(e.target.value)}
placeholder="Password"
className="w-full border rounded-lg px-4 py-3"
/>



<button

onClick={handleSubmit}

disabled={loading}

className="w-full bg-teal-600 text-white py-3 rounded-lg"

>

{loading ? "Signing in..." : "Sign In"}

</button>


</div>


<button

onClick={onShowRegister}

className="w-full mt-4 text-teal-700"

>

Create account

</button>


</div>


</main>

)

}