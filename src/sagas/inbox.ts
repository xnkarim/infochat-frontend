import { call, put, takeEvery, all, StrictEffect } from 'redux-saga/effects';
import {
  incomingMessagesFetch, clientAppealDelete,
  selectedClientUpdate, messageToInboxAdd, selectedClientInfoGet,
  messagesStatusUpdate, noteAdd, noteDelete, toSelectedTeammateRemapDialogs,
} from '../api/dataLayer';

function* fetchIncomingMessages(action: any): Generator<StrictEffect> {
  try {
    const successCallback = action.incomingMessage.successCallback;
    yield put({ type: 'FETCHING_INCOMING_MESSAGES' });
    const incomingMessage = yield call(incomingMessagesFetch, action.incomingMessage);
    yield put({ type: 'FETCHING_INCOMING_MESSAGES' });

    if (successCallback) {
      successCallback(incomingMessage);
    }

    yield put({
      type: 'ADD_INCOMING_MESSAGES',
      incomingMessage,
    });
  } catch (e) {
    yield put({
      type: 'INCOMING_MESSAGES_FETCH_FAILED',
      message: e.message,
    });
  }
}

function* changeMessagesStatus(action: any): Generator<StrictEffect> {
  try {
    const { clientId, messagesStatus, assignedTo } = action.payload;
    const successCallback = action.payload.successCallback;

    yield call(messagesStatusUpdate, action.payload);
    yield put({
      type: 'UPDATE_INCOMING_MESSAGE',
      payload: {
        clientId,
        messagesStatus,
        assignedTo,
      }
    });
    yield put({
      type: 'SELECTED_CLIENT_UPDATE',
      payload: { assignedTo },
    });

    if (successCallback) {
      yield successCallback();
    }
  } catch (e) {
    yield put({
      type: 'UPDATE_ASSIGNED_USER_FAILED',
      message: e.message,
    });
  }
}

function* updateSelectedClient(action: any): Generator<StrictEffect> {
  try {
    const successCallback = action.payload.successCallback;

    yield call(selectedClientUpdate, action.payload);
    if (successCallback) {
      yield successCallback();
    }
  } catch (e) {
    yield put({
      type: 'UPDATE_SELECTED_CLIENT_USER_FAILED',
      message: e.message,
    });
  }
}

function* addMessageToInbox(action: any): Generator<StrictEffect> {
  try {
    const successCallback = action.payload.successCallback;

    yield call(messageToInboxAdd, action.payload);

    if (successCallback) {
      yield successCallback();
    }
  } catch (e) {
    yield put({
      type: 'ADD_TO_INBOX_INCOMING_MESSAGES_FAILED',
      message: e.message,
    });
  }
}

function* getSelectedClientInfo(action: any): Generator<StrictEffect> {
  try {
    const successCallback = action.payload.successCallback;
    yield put({ type: 'FETCHING_SELECTED_CLIENT_INFO' });
    const clientInfo = yield call(selectedClientInfoGet, action.payload);
    yield put({ type: 'FETCHING_SELECTED_CLIENT_INFO' });

    if (successCallback) {
      yield successCallback(clientInfo);
    }
  } catch (e) {
    yield put({
      type: 'GET_SELECTED_CLIENT_INFO_FAILED',
      message: e.message,
    });
  }
}

function* addNote(action: any): Generator<StrictEffect> {
  try {
    console.log(action.payload);
    yield call(noteAdd, action.payload);
  } catch (e) {
    yield put({
      type: 'ADD_NOTE_FAILED',
      message: e.message,
    });
  }
}

function* deleteNote(action: any): Generator<StrictEffect> {
  try {
    yield call(noteDelete, action.payload);
  } catch (e) {
    yield put({
      type: 'DELETE_NOTE_FAILED',
      message: e.message,
    });
  }
}

function* deleteClientAppealByClientId(action: any): Generator<StrictEffect> {
  try {
    console.log(action.payload);
    yield call(clientAppealDelete, action.payload);
  } catch (e) {
    yield put({
      type: 'DELETE_CLIENT_APPEAL_FAILED',
      message: e.message,
    });
  }
}

function* remapDialogsToSelectedTeammate(action: any): Generator<StrictEffect> {
  try {
    yield call(toSelectedTeammateRemapDialogs, action.payload);
  } catch (e) {
    yield put({
      type: 'REMAP_DIALOGS_TO_SELECTED_TEAMMATE_FAILED',
      message: e.message,
    });
  }
}

function* watchFetchMessagesHistoryByProject(): Generator<StrictEffect> {
  yield takeEvery('FETCH_INCOMING_MESSAGES', fetchIncomingMessages);
}

function* watchUpdateSelectedClient(): Generator<StrictEffect> {
  yield takeEvery('CLIENT_DATA_UPDATE', updateSelectedClient);
}

function* watchAddMessageToInbox(): Generator<StrictEffect> {
  yield takeEvery('ADD_TO_INBOX_INCOMING_MESSAGE', addMessageToInbox);
}

function* watchGetInfoForSelectedClient(): Generator<StrictEffect> {
  yield takeEvery('SELECTED_CLIENT_GET_INFO', getSelectedClientInfo);
}

function* watchUpdateMessagesStatus(): Generator<StrictEffect> {
  yield takeEvery('CHANGE_MESSAGES_STATUS', changeMessagesStatus);
}

function* watchAddNote(): Generator<StrictEffect> {
  yield takeEvery('ADD_NOTE', addNote);
}

function* watchDeleteNote(): Generator<StrictEffect> {
  yield takeEvery('DELETE_NOTE', deleteNote);
}

function* watchDeleteClientAppeal(): Generator<StrictEffect> {
  yield takeEvery('DELETE_CLIENT_APPEAL', deleteClientAppealByClientId);
}

function* watchRemapDialogsToSelectedTeammate(): Generator<StrictEffect> {
  yield takeEvery('REMAP_DIALOGS_TO_SELECTED_TEAMMATE', remapDialogsToSelectedTeammate);
}

export default [
  watchFetchMessagesHistoryByProject(),,
  watchUpdateSelectedClient(),
  watchAddMessageToInbox(),
  watchGetInfoForSelectedClient(),
  watchUpdateMessagesStatus(),
  watchAddNote(),
  watchDeleteNote(),
  watchDeleteClientAppeal(),
  watchRemapDialogsToSelectedTeammate(),
];