import { httpClient } from "../config/AxiosHelper";

export const CreateRoom = async (roomDetails) => {
    const response = await httpClient.post('/api/v1/room', roomDetails);
    return response.data;
}