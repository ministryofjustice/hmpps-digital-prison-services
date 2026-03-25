export default interface PrisonHierarchyDto {
  locationId: string
  locationType: string
  locationCode: string
  fullLocationPath: string
  localName?: string
  level: number
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'DRAFT'
  subLocations?: PrisonHierarchyDto[]
}
