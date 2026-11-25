import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { createDemoRepositories } from '@/data/demoRepositories';
import { DEFAULT_CLASS_FILTERS } from '@/data/types';
import { ClassCard } from '@/features/discover/ClassCard';
import { useFontScale } from '@/theme/useFontScale';
import { FactList } from '@/ui';
import { renderWithProviders, TEST_NOW } from '@/test-utils';

jest.mock('@/theme/useFontScale', () => ({ useFontScale: jest.fn(() => 1) }));

async function firstClass() {
  const items = await createDemoRepositories(TEST_NOW).discover.classes(
    DEFAULT_CLASS_FILTERS,
    TEST_NOW,
  );
  const item = items[0];
  if (!item) {
    throw new Error('no demo class');
  }
  return item;
}

describe('Class ticket', () => {
  afterEach(() => {
    jest.mocked(useFontScale).mockReturnValue(1);
  });

  it('reads as one button with the whole class in its label', async () => {
    const item = await firstClass();
    await renderWithProviders(<ClassCard item={item} />);
    const ticket = screen.getByTestId(`class-card-${item.session.id}`);
    expect(ticket.props.accessibilityRole).toBe('button');
    expect(String(ticket.props.accessibilityLabel)).toContain(item.organization.name);
  });

  it('stacks the stub above the details when the text is large', async () => {
    const item = await firstClass();
    const direction = () =>
      StyleSheet.flatten(
        screen.getByTestId(`ticket-top-${item.session.id}`, { includeHiddenElements: true }).props
          .style,
      ).flexDirection;
    await renderWithProviders(<ClassCard item={item} />);
    expect(direction()).toBe('row');
    jest.mocked(useFontScale).mockReturnValue(1.5);
    await renderWithProviders(<ClassCard item={item} />);
    expect(direction()).toBe('column');
  });
});

describe('FactList', () => {
  it('reads each fact as label and value', async () => {
    await renderWithProviders(
      <FactList
        facts={[
          { label: 'Level', value: 'Beginner' },
          { label: 'Duration', value: '10 min' },
        ]}
      />,
    );
    expect(screen.getByLabelText('Level, Beginner')).toBeTruthy();
    expect(screen.getByLabelText('Duration, 10 min')).toBeTruthy();
  });
});
