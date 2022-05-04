const tasks = () => {
    const [tasks, setTasks] = useState([
    {
        id: 1,
        text: 'Test Task',
        day: '02.02.2022',
        reminder: true,
    },
    {
        id: 2,
        text: 'Test Task 2',
        day: '02.02.2022',
        reminder: false,
    },
])

return (
    <div className='container'>
        <Header />
        <Tasks />
    </div>
    )
}