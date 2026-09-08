#For Developers
#==============================================================

#Naming Conventions
#==================
    1. Directory Naming: Use camelCase for directory names. If a directory represents a component and its associated files, the directory name should match the component name.
        
    2. Page Naming
        1. Component Naming - Use PascalCase for React components. Each component should be in its own file, and the filename should match the component name. For example, MyComponent.js

        2. Container Naming - Use PascalCase for React container. Each component should be in its own file, and the filename should match the component name. For example, Home.js

        3. custom hook naming - hook naming start with keyword use and it will like useCounter.js
        
        4. Redux slice naming: use camel casing with Slice keyword in the end like valveCategorySlice.js.

        5. Test Files: Append .test or .spec to the original filename. For example, MyComponent.test.js

        6. Stylesheet Files: If you're using CSS modules, the filename should match the component name. For example MyComponent.module.css

    3. Variable Naming
        1. Constant Variable - All constants variables in UPPER CASE separated with underscore e.g DEFAULT_ATMOSPHERIC_PRESSURE. constants will be defined in utils/constants.js file

        2. local variables - All local variables will be in lower case.

        3. Props, State Variables Names: Use camelCase. For example,thisIsAProp, thisIsAStateVariable
    
    4. Function Names: for any function or reducer functions Use camelCase. For example, thisIsAFunction()

#===============================================================
#Component Handling
    - basic component: We will be using basic component from mui library like BUTTON, FORMLABEL, RADIO, CHECKBOX, SELECT, TextField etc. 
        Note - Make sure that component name should not contradict with mui library component naming.

    - compound Component: If we have to use group of basic components or different basic components together, than we will create compound components
        Note - if we need multiple compound components for same category than try to create folder and keep those components in that folder.

    - HOC: If we are using common code in different components, containers we will create higher order component and pass the component within that HOC

    Note: try to keep the component as small as it is. break the component into small usefull component (if that piece of code is used in some other place)


#===============================================================
#Redux Slice handing:
    1. As mentioned above naming would be in camel casing valveCategorySlice.js

    2. Create Slice with same name as file name e.g for valveCategory Slice naming would be valveCategorySlice
        - Mention the name, initialState and reducer fucntions in createSlice
        - export the slice reducer
        - add the reducer in store.js file
        - the name you will mention in the store for reducer will be used to extract data from store using useSelector e.g useSelector((state)=> state.valeCategory)

    3. If we are having thunk in Slice than thunk variable name and thunk naming would be like fetchValveCategory and keep the same name for both variable and thunk.
    
    4. Define all 3 states of promise for thunk in extraReducer
    
    5. Mention the Slice reducer in store

    6. for Reducer functions: Use camelCase. For example, thisIsAFunction()
#===============================================================

#Handing State
#=============
1. Whereever we are having local state and that state is changed using functions and effects convert it into custom hook and shift that logic in hook and call the hook variable and functions.

2. For Global State: 
    1. useDispatch to call asyncThunk and reducer functions
    2. use useSelector to get data from Reducer and destructure the initialState values

#===============================================================

#Custom Hooks
1. Custom Hook naming and file naming would be same.
2. Pass the initial values required in state.
3. Declare the state variables required.
4. Declare the fucntions and useEffect in custom hook
5. return the variables and functions that are required in components.
6. export the custom hook.

#===============================================================

#Service and Utility Functions: 
    -If you have service or utility functions, they should be in their own file or grouped together in a services or utils directory. Use camelCase for the filenames