# extore

This lib helps you manage your application state in a flux way through React's Context API.

## createStore(state: any, actions: object) => Component

By passing a default state object and a list of actions to the `createStore()` function, you will create a new component with its own context. It will expose its state along with the actions you specified so that every consumer of its context may be able to read and update the current state.

Once the store is built, it will initialize the state with the value you specified, then will add every actions inside as well. To make writing your actions easier, all of them will be bound to the store's state when they are called. This means you'll have internal access to the state using `this` and that you can access other actions from your actions easily, as they're technically part of the store's state.

In order to still be able to modify the state, a proxy to the `setState` function is also put in the state so that you can call it from your actions using `this.setState` as you would usually do.

Beware though not to have any collision between your actual state object keys and the name of your actions. At setup, actions will overwrite any piece of state that have the same name and later, when you use `setState`, you might also replace your actions with simple values.

```JS
const state = {
  counter: 0,
}

const actions = {
  changeCounter(change) {
    // access the store's state content directly through this
    const counter = this.counter + change

    // modify the state with this.setState
    this.setState({ counter })
  }

  increment() {
    // access the other actions with this
    this.changeCounter(+1)
  }

  decrement() {
    this.changeCounter(-1)
  }
}

const Store = createStore(state, actions)

// wrap your app with it to make it a global context
// but remember you can also put it anywhere else in the tree for more detailed scoping
ReactDOM.render(<Store><App /></Store>, root)
```

## connect(stores: object, selector: function) => (component: Component) => Component

Now that your Store is ready, you'll want to connect some components to it in order to consume the context. To do so, pass an object to the connect function listing the stores you'll want to connect to.

The connect function is a helper that will combine different Context Consumers for each store mentionned and pass their state as props.

The connected component will receive props matching the object you gave, meaning for each key you defined in this object, one prop will be created, containing the state and actions of the corresponding store.

You can also pass an optional selector as 2nd parameter, it will read all the props that the component
receives, including the consumed context. The object it returns will be the only props passed to the connected component.

```JS
import AuthStore from '../stores/auth'
import FilesStore from '../stores/files'

// auth store:
// - state: { user: object | null }

// files store:
// - state: { list: [{ id: number, name: string }]}
// - actions: { delete(id: string) }

const FileList = ({ isAuthenticated, files }) => {
  if (!isAuthenticated) {
    return null
  }

  return (
    <ul>
      {files.list.map(file => (
        <li key={file.id}>
          <span>{file.name}</span>
          <button onClick={() => files.delete(file.id)}>x</button>
        </li>
      ))}
    </ul>
  )
}

function selector({ auth, files }) {
  return { isAuthenticated: Boolean(auth.user), files }
}

export default connect({ auth: AuthStore, files: FileStore }, selector)(FileList)
```

## combineStores(...stores: [Component]) => Component

If you do not want to manually add all the stores in your app, you can generate a wrapper component that will render them for you in one place. For that you need to pass a series of Stores to the `combineStores` function and it will return you the wrapper component.

```JS
import AuthStore from '../stores/auth'
import FilesStore from '../stores/files'

const GlobalStore = combineStores(AuthStore, FilesStore)

// the GlobalStore will render both the auth and files store around the App
render(<GlobalStore><App /></GlobalStore>, root)
```
