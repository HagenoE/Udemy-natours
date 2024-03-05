import axios from 'axios'
import { showAlert } from './alert'
export const updateData = async (data, type) => {

  try {


    const res = await axios.patch(`/api/v1/users/${type === 'settings' ? 'updateCurrent' : 'updatePassword'}`, {
      data
    })

    showAlert('success', 'Updated')

    if (res.status.data === 'success') {
      window.setTimeout(() => {
        location.assign('/me')
      }, 1000)
    }


  } catch (error) {
    showAlert('error', error.response.data.message)
  }

}