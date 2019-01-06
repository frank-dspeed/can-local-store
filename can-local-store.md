@module can-local-store can-local-store
@parent can-data-modeling
@collection can-infrastructure
@group can-local-store.data-methods data methods

Create, update, delete and query data saved in localStorage.

@signature `localStore( baseConnection )`

Create a database-like store of a single data type. For example:

```js
import localStore from "can-local-store";
import QueryLogic from "can-query-logic";

// Create a store
var todosStore = localStore({
    queryLogic: new QueryLogic({
        identity: ["id"]
    }),
    name: "todos"
});

// Add a list of data to the store
todosStore.updateListData(...);
// Get a list of data from the store
todosStore.getListData(...)
// Create a record in the store
todosStore.createData(...)
// Get a record in the store
todosStore.getData(...)
// Update a record in the store
todosStore.updateData(...)
// Remove a record from the store
todosStore.destroyData(...)
// Clear all records from the store
todosStore.clear()
// Get the queries that are currently stored
todosStore.getQueries()
```

@param {Object} [baseConnection] A base [can-connect] connection or a settings object. `baseConnection`
  must have:
  - a `queryLogic` property that references a [can-query-logic] instance. The `can-query-logic`
    instance is used to determine the behavior of [can-local-store.getListData].
  - a unique `name` property used as a key to store data in localStorage.

  It can optionally have:
  - a `cacheLocalStorageReads` property.  When set to `true`, prevents reading from localStorage and parsing the result on
    every read.

@body

## Use

`can-local-store` is used as a store of query-able data.  It can either be used on its own or
as part of a [can-connect] cache connection.

### Standalone use

To use `localStore`, first create one with a `queryLogic` instance:

```js
import localStore from "can-local-store";
import QueryLogic from "can-query-logic";

// Create a store
var todosStore = localStore({
    queryLogic: new QueryLogic({
        identity: ["id"]
    })
});
```

Then populate the store with data:

```js
todosStore.updateListData([
    {id: 1, name: "dishes", points: 2},
    {id: 2, name: "lawn", points: 8},
    {id: 3, name: "trash", points: 1},
    {id: 4, name: "car wash", points: 5},
]);
```

Then you can query the store for data:

```js
todosStore.getListData({
    filter: {points: {$gt: 1}},
    sort: "name",
    page: {start: 0, end: 1}
})
//-> {
//   data: [
//     {id: 4, name: "car wash", points: 5},
//     {id: 1, name: "dishes", points: 2}],
//   count: 3
// }
```

### Use with connection


`can-local-store` is often used with a caching strategy like [can-connect/fall-through-cache/fall-through-cache] or
[can-connect/cache-requests/cache-requests] as their
`cacheConnection`. The following gives an example of using it with the
`connectFallThroughCache`:

```js
import {
    DefineMap,
    QueryLogic,
    localStore,
    connectFallThroughCache,
    connectCanMap,
    connectRest,
    connectConstructor,
    connect
} from "can";

// Define a type
const Todo = DefineMap.extend("Todo",{
    id: {identity: true, type:"number"},
    name: "string",
    complete: "boolean"
});

// Create a store
var todosStore = localStore({
    queryLogic: new QueryLogic(Todo),
    name: "todos"
});

var todoConnection = connect([
  connectRest,
  connectMap,
  connectFallThroughCache,
  connectConstructor
],
{
  url: "/services/todos",
  cacheConnection: todosStore
});
```


## Caching localStorage reads

If your data set is large, you might want to avoid reading and parsing localStorage on every
access to the local store. To avoid this, you can turn on `cacheLocalStorageReads` like:


```js
var todosStore = localStore({
    queryLogic: new QueryLogic({
        identity: ["id"]
    }),
    name: "todos",
    cacheLocalStorageReads: true
});
```


## Importent Additional Security Note

You should never store Sensitive Data like Credentials in Localstorage! It's not directly related to this package but it helps a lot to make the web a better place Credentials and sensitive data needs to be stored Secure in Memory or in a Secured Cookie a good Article about that can be found here: https://blog.teamtreehouse.com/how-to-create-totally-secure-cookies

Here are some good resources to read through:

http://cryto.net/%7Ejoepie91/blog/2016/06/13/stop-using-jwt-for-sessions/
https://www.infoworld.com/article/3184582/security/critical-flaw-alert-stop-using-json-encryption.html
https://hn.nuxtjs.org/item/16748400 (read lvh comments)
https://github.com/paragonie/paseto (a token implementation designed to work around JWT cryptographic flaws)
https://paragonie.com/blog/2018/03/paseto-platform-agnostic-security-tokens-is-secure-alternative-jose-standards-jwt-etc
https://paragonie.com/blog/2017/03/jwt-json-web-tokens-is-bad-standard-that-everyone-should-avoid

when is local storage compromised... Read through OWASP top 10: https://www.owasp.org/images/7/72/OWASP_Top_10-2017_%28en%29.pdf.pdf (XSS has been one of the top 10 web exploits since 2013 and likely far before).
