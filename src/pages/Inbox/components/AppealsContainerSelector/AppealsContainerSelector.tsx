import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import 'moment/locale/ru';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

import Animal from 'ui/Animal/Animal';
import Popup from 'ui/Popup/Popup';
import Input from 'ui/Input/Input';
import Button from 'ui/Button/Button';
import AppealsSkeleton from 'ui/Skeleton/AppealsSkeleton/AppealsSkeleton';

import { SidebarContext } from 'context/SidebarContext';
import { IIncomingMessage, IMessagesHistory, SelectedClient, Filters } from 'types/inbox';
import { getClientName, getLastUnreadMessagesCount } from 'lib/utils/clientData';
import { useActions } from 'hooks/useActions';
import { useTypedSelector } from 'hooks/useTypedSelector';
import { Context } from 'context/Context';
import styles from './appealsContainerSelector.module.scss';

interface FilterVariant {
  id: string,
  value: string,
}

interface AppealsContainerSelectorProps {
  inboxFilters: Filters,
  messages: IIncomingMessage[],
}

export default function AppealsContainerSelector({
  inboxFilters,
  messages
}: AppealsContainerSelectorProps) {
  const { channels } = useTypedSelector(state => state.channels);
  const { teammates } = useTypedSelector(state => state.teammates);
  const { incomingMessages } = useTypedSelector(state => state.inbox);
  const { clientId: selectedClientId } = useTypedSelector(state => state.inbox.selectedClient);
  const { isFetchingIncomingMessages } = useTypedSelector(state => state.inbox);

  const [isOpenSearchPopup, toggleOpenSearchPopup] = useState(false);
  const [filters, updateFilters] = useState(inboxFilters);

  const {
    getClientInfo, updateIncomingMessagesFilters,
    updateSelectedClient, selectClient
  } = useActions();
  const { currentUser } = useContext(Context);
  const { updateSidebar } = useContext(SidebarContext);
  let { projectId } = useParams<{projectId: string}>();

  const showClientMessages = (clientId: string) => {
    if (clientId !== selectedClientId) {
      const successCallback = (clientInfo: SelectedClient) => {
        updateSelectedClient({
          changesHistory: clientInfo.changesHistory,
          notes: clientInfo.notes,
        });
      };

      const selectedClient = incomingMessages.find(message => message.clientId === clientId);
      if (selectedClient) {
        selectClient(cloneDeep(Object.assign(selectedClient)));
      }

      getClientInfo({
        projectId,
        clientId,
        successCallback,
      });
    }
  };
  
  const getLastMessage = (messagesHistory: IMessagesHistory[], clientName: string) => {
    const lastMessage = messagesHistory[messagesHistory.length - 1];
    let pureLastMessage;
    const lastMessageText = lastMessage.message as string;
    if (lastMessageText) {
      pureLastMessage = lastMessageText.replace(/<[^>]*>?/gm, '');
    }
    const username = lastMessage.username;

    return username === 'client' ? `<span class=${styles.greeting}>${clientName}:</span> ${pureLastMessage}` : `<span class=${styles.greeting}>Вы:</span> ${pureLastMessage}`;
  };

  const getLastMessageCreationDate = (messagesHistory: IMessagesHistory[]) => {
    const lastMessage = messagesHistory[messagesHistory.length - 1];
    const timestamp = lastMessage.timestamp;

    if (timestamp) {
      const date = moment(timestamp);
      date.locale('ru');

      return date.format('DD MMM');
    }

    return null;
  };

  const getTeammates = () => {
    const formattedTeammates = teammates.map((teammate) => {
      if (currentUser.email === teammate.email) {
        return {
          id: teammate.email,
          value: 'Мне',
        }
      }

      return {
        id: teammate.email,
        value: teammate.username,
      }
    });

    formattedTeammates.unshift({
      id: 'all',
      value: 'Все',
    });
    
    return formattedTeammates;
  };

  const getChannels = () => {
    const formattedChannels = channels.map((channel) => {
      if (channel.name === 'chat') {
        return {
          id: channel.name,
          value: 'Чат на сайте',
        }
      }

      return {
        id: channel.name,
        value: channel.name,
      }
    });

    formattedChannels.unshift({
      id: 'all',
      value: 'Все',
    });

    return formattedChannels;
  };

  const updateSearchByFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    updateFilters((prev) => {
      return {
        ...prev,
        searchBy: {
          value,
          tag: prev.searchBy.tag
        }
      };
    });
  };

  const selectOption = (filterName: string, id: string | number) => {
    updateSidebar(prev => ({
      ...prev,
      [filterName]: id as string,
    }));
    updateFilters((prev) => ({
      ...prev,
      [filterName]: filterName === 'searchBy' ?
        {
          value: prev.searchBy.value,
          tag: id
        } :
        id
    }));
  };

  const findIncomingMessagesByFilters = () => {
    updateIncomingMessagesFilters(filters);
    toggleOpenSearchPopup(prev => !prev);
  };

  const PopupBodySearch = ({ filters }: { filters: Filters }) => {
    const searchBy = [
      {
        id: 'text',
        value: 'Только в тексте',
      },
      {
        id: 'username',
        value: 'Только по имени',
      },
      {
        id: 'email',
        value: 'Только по email',
      },
      {
        id: 'phone',
        value: 'Только по телефону',
      },
    ];
    const teammates = getTeammates();
    const channels = getChannels();

    const getFilterValue = (filterId: string, filterName: FilterVariant[]) => {
      return filterName.find((channel) => channel.id === filterId)?.value;
    };

    return (
      <div>
        <p className={styles.title}>Поиск</p>

        <div className={styles.popupBodyContainer}>
          <div className={styles.selector}>
            <span className={styles.label}>Поиск по</span>
            <Input
              type='text'
              onSelect={(id: string | number) => selectOption('searchBy', id)}
              value={getFilterValue(filters.searchBy.tag, searchBy)}
              fixedSelect
              readOnly
              classNames={styles.input}
              data={searchBy}
            />
          </div>

          <div className={styles.selector}>
            <span className={styles.label}>В канале</span>
            <Input
              type='text'
              onSelect={(id: string | number) => selectOption('channel', id)}
              value={getFilterValue(filters.channel, channels)}
              fixedSelect
              readOnly
              classNames={styles.input}
              data={channels}
            />
          </div>

          <div className={styles.selector}>
            <span className={styles.label}>Назначено</span>
            <Input
              type='text'
              onSelect={(id: string | number) => selectOption('assigned', id)}
              value={getFilterValue(filters.assigned, teammates)}
              fixedSelect
              readOnly
              classNames={styles.input}
              data={teammates}
            />
          </div>

          <div className={styles.searchButton}>
            <Button
              type='button'
              classNames={styles.searchBtn}
              fluid
              onClick={findIncomingMessagesByFilters}
            >
              Поиск
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const resetSearchByFilter = () => {
    updateFilters((prev) => {
      return {
        ...prev,
        searchBy: {
          value: '',
          tag: prev.searchBy.tag
        }
      };
    });
  };

  useEffect(() => {
    updateFilters(inboxFilters);
  }, [inboxFilters]);

  return (
    <div className={styles.appealsContainerSeletor}>
      <div className={styles.searchPanelContainer}>
        <Popup
          isOpenPopup={isOpenSearchPopup}
          body={<PopupBodySearch filters={filters}/>}
          width='339px'
          onClick={(bool?: boolean) => {
            if (typeof bool === 'boolean') {
              toggleOpenSearchPopup(bool);
            } else {
              toggleOpenSearchPopup(true);
            }
          }}
        >
          <div className={styles.searchContainer}>
            <FontAwesomeIcon
              icon={faSearch}
              className={styles.searchIcon}
              color='$grey-4'
            />
              <Input
                type='text'
                classNames={styles.search}
                placeholder='Поиск по людям или сообщениям'
                allowClear
                onClear={resetSearchByFilter}
                onChange={updateSearchByFilter}
              />
          </div>
        </Popup>
      </div>
      
      <div className={styles.appealsContainer}>
        {
          isFetchingIncomingMessages ?
          <AppealsSkeleton /> :
          messages && messages.length > 0 &&
          messages.map((incomingMessage: IIncomingMessage, idx: number) => {
            const clientName = getClientName(incomingMessage.avatarColor, incomingMessage.avatarName);
            const unreadMessagesCount = getLastUnreadMessagesCount(incomingMessage);
            const isUnreadMessageBlockAndNotSelected = !(incomingMessage.clientId === selectedClientId) && unreadMessagesCount > 0;

            return (
              <div
                key={idx}
                className={`
                  ${styles.incomingMessage}
                  ${incomingMessage.clientId === selectedClientId ? styles.selected : styles.message }
                  ${isUnreadMessageBlockAndNotSelected && incomingMessage.messagesStatus === 'opened' && styles.unreadMessageBlock}
                `}
                onClick={() => showClientMessages(incomingMessage.clientId)}
              >
                <Animal
                  name={incomingMessage.avatarName}
                  color={incomingMessage.avatarColor}
                  size='26px'
                />

                <div className={styles.clientAndLastMessage}>
                  <div className={styles.clientName}>{ clientName }</div>
                  <div
                    className={`
                      ${styles.lastMessage}
                      ${incomingMessage.clientId === selectedClientId && styles.lastMessageSelected}`
                    }
                    dangerouslySetInnerHTML={{__html: getLastMessage(incomingMessage.messagesHistory, clientName)}}
                  />
                </div>

                <div className={styles.countAndCreationDate}>
                  <span
                    className={`
                      ${styles.time}
                      ${incomingMessage.clientId === selectedClientId && styles.timeSelected}
                    `}
                  >
                    { getLastMessageCreationDate(incomingMessage.messagesHistory) }
                  </span>
                  {
                    isUnreadMessageBlockAndNotSelected &&
                    <div className={styles.count}>{unreadMessagesCount}</div>
                  }
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
};