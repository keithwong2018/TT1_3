import { Redirect } from "react-router-dom"
import { useState } from "react"
import customers from '../data/customers.json'

const Login = ({setLoggedin}) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [redirect, setRedirect] = useState(false)
    let errorMessage

    const onSubmit = (e) => {
        e.preventDefault()
        
        customers.forEach((customer) => {
            if (customer.username === username) {
                if (customer.password === password) {

                    setRedirect(true)

                } else {
                    errorMessage = (<h2>Wrong password</h2>)
                }
            } else {
                errorMessage = (<h2>No account found</h2>)
            }
        })
    }

    if (redirect) {
        return <Redirect to="/home" />
    } else {
        return (
            <div>
                <form>
                    <h1 className="h3 mb-3 fw-normal">Please sign in</h1>

                    <div className="form-floating">
                        <input type="text" className="form-control" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                        <label>Username</label>
                    </div>
                    <div className="form-floating">
                        <input type="password" className="form-control" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                        <label>Password</label>
                    </div>
                    <button className="w-100 btn btn-lg btn-primary" type="submit" onClick={onSubmit}>Sign in</button>
                    <div>
                        {errorMessage}
                    </div>
                </form>
            </div>
        )
    }
}

export default Login