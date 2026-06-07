// Add more items to marketData
export const marketData = [
  ...Array.from({ length: 6 }).map((_, i) => ({
    id: `dump-${i}`,
    title: 'High Balance Dump ' + (i + 1),
    price: `$${50 + i * 20}`,
    category: 'Dumps',
    country: ['US', 'UK', 'CA', 'AU'][i % 4],
    balance: `$${1000 + i * 500}`,
    bank: ['Chase', 'Bank of America', 'Barclays', 'HSBC'][i % 4],
    level: ['Classic', 'Gold', 'Platinum'][i % 3],
    icon: '💳'
  })),
  ...Array.from({ length: 6 }).map((_, i) => ({
    id: `rdp-${i}`,
    title: 'Admin RDP ' + (i + 1),
    price: `$${25 + i * 15}`,
    category: 'RDP',
    country: ['US', 'UK', 'RU', 'NL'][i % 4],
    balance: 'N/A',
    bank: 'Datacenter',
    level: 'Access',
    icon: '🖥️'
  })),
  ...Array.from({ length: 6 }).map((_, i) => ({
    id: `fullz-${i}`,
    title: 'Premium Fullz ' + (i + 1),
    price: `$${30 + i * 10}`,
    category: 'Fullz',
    country: ['US', 'UK', 'CA', 'AU'][i % 4],
    balance: 'High CS',
    bank: ['Experian', 'Equifax', 'TransUnion'][i % 3],
    level: ['800+', '750+', '700+'][i % 3],
    icon: '📝'
  }))
];
