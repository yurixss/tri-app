import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '../constants/Styles';
import { commonStyles } from '../constants/Styles';
import { ChevronDown } from 'lucide-react-native';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownSelectorProps {
  label: string;
  options: DropdownOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function DropdownSelector({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Selecione uma opção',
}: DropdownSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const backgroundColor = useThemeColor({}, 'cardBackground');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const selectedOption = options.find(opt => opt.value === selectedValue);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <ThemedText 
        style={commonStyles.inputLabel}
        fontFamily="Inter-Medium"
      >
        {label}
      </ThemedText>
      
      <TouchableOpacity
        style={[
          commonStyles.input,
          styles.dropdown,
          { 
            backgroundColor, 
            borderColor,
          }
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <ThemedText 
          style={[
            styles.dropdownText,
            { color: selectedOption ? textColor : '#9CA3AF' }
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </ThemedText>
        <ChevronDown size={20} color={textColor} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View 
            style={[
              styles.modalContent,
              { backgroundColor, borderColor }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedValue === item.value && {
                      backgroundColor: tintColor + '20',
                    }
                  ]}
                  onPress={() => handleSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={[
                      styles.optionText,
                      selectedValue === item.value && {
                        color: tintColor,
                        fontFamily: 'Inter-SemiBold',
                      }
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                  {selectedValue === item.value && (
                    <View style={[styles.checkmark, { backgroundColor: tintColor }]} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    minHeight: 44,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
