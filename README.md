# extore

This lib gives you helpers to manage your application state in a flux way through React's Context API.

## createStore(helpers: object) => function

Before actually creating your stores, you will need to build the factory that will produce them.

```JS
const store = createStore()
```

In order to avoid repeating features that would be shared between many stores, you can specify a helper object as parameter. The content of this object should only be functions. Once a store based on this factory is rendered, it will bind those tools to its own context (this) and then pass them as parameter to your action creator function.

```JS
// those are the default helpers
// they will always be available unless you explicitely overwrite them
const helpers = {
  getState() {
    return this.state
  },

  setState(state) {
    this.setState(state)
  }
}

const store = createStore(helpers)
```

## store(defaultState: any, actions: function) => Component

By passing a default state object and a list of actions to the `store()` factory, you will create a new component with its own context. It will expose its state along with the actions you specified so that every consumer of its context may be able to read and update the current state.

When the store is ready, use it as any other component in your React tree. Any of its descendant will now have access to its state and actions if they connect to it.

```JS
const state = {
  counter: 0,

  data: {},
  error: null,
  loading: false
}

// the action creator gets the helpers bound to the current store's context (see above)
const actions = ({ getState, setState }) => ({
  increment() {
    setState({ counter: getState().counter + 1})
  }

  async loadData(path) {
    setState({ loading: true, error: null })
    const res = await fetch(path).then(res => res.json())
    setState({ loading: false, data: res.data, error: res.error })
  }
})

const Store = store(state, actions)

// wrap your app with it to make it a global context
// but remember you can also put it anywhere else in the tree for more detailed scoping
ReactDOM.render(<Store><App /></Store>, root)
```

## connect(stores: object) => (component: Component) => Component

Now that your Store is ready, you'll want to connect some components to it in order to consume the context. To do so, pass an object to the connect function listing the stores you'll want to connect to.

The connect function is a helper that will combine different Context Consumers for each store mentionned and pass their content as props.

The connected component will receive props matching the object you gave, meaning for each key you defined in this object, one prop will be created, containing the state and actions of the corresponding store.

```JS
import AuthStore from '../stores/auth'
import FilesStore from '../stores/files'

// auth store:
// - state: { user: object | null }

// files store:
// - state: { list: [{ id: number, name: string }]}
// - actions: { delete(id: string) }

const FileList = ({ auth, files }) => {
  if (!auth.user) {
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

export default connect({ auth: AuthStore, files: FileStore })(FileList)
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
