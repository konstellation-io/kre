type Domain = {
  name: string;
};

export function formatDomain(domain:any) {
  return {
    name: domain.name,
  } as Domain;
}
