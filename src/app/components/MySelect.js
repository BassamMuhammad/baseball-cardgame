import { useState } from "react";
import {
  Combobox,
  Group,
  Input,
  InputBase,
  Text,
  useCombobox,
} from "@mantine/core";

function SelectOption({ pic, value, label }) {
  return (
    <Group>
      <Text fz={20}>{pic}</Text>
      <div>
        <Text fz="sm" fw={500}>
          {value}
        </Text>
        <Text fz="xs" opacity={0.6}>
          {label}
        </Text>
      </div>
    </Group>
  );
}

export function MySelect({ data }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = (useState < string) | (null > null);
  const selectedOption = data.find((item) => item.value === value);

  const options = data.map((item) => (
    <Combobox.Option value={item.value} key={item.value}>
      <SelectOption {...item} />
    </Combobox.Option>
  ));

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val) => {
        setValue(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
          multiline
        >
          {selectedOption ? (
            <SelectOption {...selectedOption} />
          ) : (
            <Input.Placeholder>Pick value</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
