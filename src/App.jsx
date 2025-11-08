import { gql } from '@apollo/client';
import './App.css'
import Board from './components/board/Board'
import Layout from './root/Layout'
import graphqlClient from './graphqlClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import MeetingRoom from './components/MeetingRoom';
const DELETE_PROJECT = gql`
  mutation DeleteProject($id: Int!) {
    deleteProject(id: $id) {
      success
      message
    }
  }
`;
const GET_PROJECTS = gql`
  query {
    allProjects {
      id
      name
      description
      status
      priority
      progress
    }
  }
`;
function App() {
  // const [deleteProject, { loading, error }] = useMutation(DELETE_PROJECT, {
  //   refetchQueries: ["GetProjects"],
  // });
    const { data, isLoading, isError, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => graphqlClient.request(GET_PROJECTS),
  });
  

  const deleteMutation = useMutation({
    mutationFn: async (id) => graphqlClient.request(DELETE_PROJECT, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  // const { loading, error, data } = useQuery(GET_PROJECTS);
console.log("data",data)
  return (
    <>
       {/* <Layout> */}
        {/* <button
        className="px-3 py-1 bg-red-500 text-white rounded"
        onClick={() => deleteMutation.mutate(10)}
        disabled={deleteMutation.isLoading}
        >
        {deleteMutation.isLoading ? "Deleting..." : "Delete"}
        </button>
        {deleteMutation.isError && <p className="text-red-500">{deleteMutation.error.message}</p>} */}
        {/* // <Board /> */}
        <MeetingRoom/>
    {/* </Layout> */}
        </>
  )
}

export default App
