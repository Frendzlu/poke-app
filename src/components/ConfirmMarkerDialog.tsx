import React from "react";
import { Button, Dialog, Portal, Text } from "react-native-paper";

function ConfirmMarkerDialog({
  visible,
  onDismiss,
  onConfirm,
}: {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
}) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Add a marker here</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Are you sure you found your favorite pokemon here?
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onConfirm}>Yes, I'm sure!</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export default ConfirmMarkerDialog;
