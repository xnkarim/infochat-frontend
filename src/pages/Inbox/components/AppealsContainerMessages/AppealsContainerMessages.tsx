import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive } from '@fortawesome/free-solid-svg-icons';

import Button from '../../../../components/Button/Button';
import { ModalProps } from '../../../../components/Modal/Modal';
import MessageInner from '../MessageInner/MessageInner';
import MessageInputContainer from '../MessageInputContainer/MessageInputContainer';

import styles from './appealsContainerMessages.module.scss';
import { useActions } from '../../../../hooks/useActions';
import { useTypedSelector } from '../../../../hooks/useTypedSelector';
import { getClientName } from '../../../../utils/clientData';

interface AppealsContainerMessagesProps {
  closeModal: ModalProps['onClose'],
  setModalProps: (data: ModalProps) => void,
}

export default function AppealsContainerMessages({ closeModal, setModalProps }: AppealsContainerMessagesProps) {
  const { selectedClient } = useTypedSelector(state => state.inbox);
  const { incomingMessages } = useTypedSelector(state => state.inbox);
  const { changeMessagesStatus } = useActions();
  let { projectId } = useParams<{ projectId: string }>();
  const messagesHistoryContainerRef = useRef<HTMLDivElement>(null);

  const isDisabled = () => !incomingMessages.find(incMsg => incMsg.clientId === selectedClient.clientId)?.assignedTo;

  const closeDialog = () => {
    changeMessagesStatus({
      messagesStatus: 'closed',
      projectId,
      clientId: selectedClient.clientId,
    });
  };

  const archiveDialog = () => {
    setModalProps({
      show: true,
      title: 'Удалить обращение?',
      body: <ModalBody />,
      footer: <ModalFooter />,
      width: '500px',
      position: 'top',
      onClose: closeModal,
    });
  };

  const ModalBody = () => <p className={styles.modalBody}>Вы действительно хотите удалить обращение?</p>;

  const ModalFooter = () => {
    return (
      <div className={styles.modalFooter}>
        <Button
          type='button'
          classNames={`${styles.button} ${styles.marginRight}`}
          background='edit'
          onClick={() => closeModal()}
        >
          Отмена
        </Button>

        <Button
          type='button'
          classNames={styles.button}
          onClick={closeModal}
        >
          Удалить
        </Button>
      </div>
    );
  };
  
  const setAnimationClass = (childrenNodesLength: number, childrenNodes: HTMLCollection) => {
    for (let i = childrenNodesLength; i > 0; i--) {
      const node = childrenNodes[i - 1];
      
      setTimeout(() => {
        if (node.classList.contains(styles.animationClass)) return;
        node.className = node.className.concat(` ${styles.animationClass}`);
      }, (childrenNodesLength - i) * 50);
    }
  };

  const removeAnimationClass = (childrenNodesLength: number, childrenNodes: HTMLCollection) => {
    for (let i = childrenNodesLength; i > 0; i--) {
      const node = childrenNodes[i - 1];
      node?.classList.remove(styles.animationClass);
    }
  };

  useEffect(() => {
    const messagesHistoryContainerElement = messagesHistoryContainerRef.current;

    if (messagesHistoryContainerElement) {
      const childrenNodes = messagesHistoryContainerElement.children;
      const childrenNodesLength = childrenNodes.length;

      setAnimationClass(childrenNodesLength, childrenNodes);

      return () => {
        removeAnimationClass(childrenNodesLength, childrenNodes);
      };
    }
  }, [incomingMessages]);

  return (
    <div className={styles.converasationChatContainer}>
      <div className={styles.dialogHeader}>
        <div>
          <p className={styles.clientName}>{ getClientName(selectedClient.avatarColor, selectedClient.avatarName) }</p>
        </div>

        <div
          onClick={archiveDialog}
          className={styles.archiveIconContainer}
        >
          <FontAwesomeIcon icon={faArchive} className={styles.iconArchive}/>
        </div>

        <div className={styles.buttonContainer}>
          <Button
            type='button'
            fluid
            background='edit'
            classNames={styles.closeDialogBtn}
            onClick={closeDialog}
            disabled={isDisabled()}
          >
            Закрыть диалог
          </Button>
        </div>
      </div>

      <div
        className={styles.messagesHistoryContainer}
        ref={messagesHistoryContainerRef}
      >
        {
          selectedClient.messagesHistory.map((message, idx) => {
            return (
              <MessageInner
                key={idx}
                message={message}
              />
            );
          })
        }
      </div>
      <MessageInputContainer
        messagesHistoryContainerElement={messagesHistoryContainerRef.current}
      />
    </div>
  );
}