export default interface PrisonHierarchyDto  {
  locationId: string
  locationType: string
  locationCode: string
  fullLocationPath: string
  localName: string
  level: number
  status: string
  subLocations: PrisonHierarchyDto[]
}
