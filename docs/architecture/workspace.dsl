workspace {
    model {

        user = person " Prison Staff User" "Someone who needs access to prisoner information to carry out their duties"
        
        DPSHomePage = softwareSystem "DPS Homepage Service" {
            tags "HMPPS Digital Service" 
            DPSHomePageUI = container "DPS UI service"
        }

        HMPPSDigitalServices = softwareSystem "HMPPS Digital Services" {
            tags "HMPPS Digital Service" 
            DigitalPrisonServices = container "Digital Prison Services"
        }

        HMPPSAuth = softwareSystem "HMPPS Auth" "Authentication and Authorization server"{
            tags "HMPPS Digital Service" 
            tokenVerificationAPI = container "Token Verification API"
        }

        ExternalSystems = softwareSystem "External Systems" {
            tags "External System"
            ContentfulAPI = container "Contentful API"
        }

        NOMIS = softwareSystem "NOMIS" {
            tags "Legacy System"
            prisonApi = container "Prison API"
            database  = container "NOMIS DB" "Nomis DB" "Oracle" "Database"

            prisonApi -> database "reads"
        }

        user -> DPSHomePage "uses"
        DPSHomePage -> DigitalPrisonServices "is a landing page for"
        DigitalPrisonServices -> prisonApi "consumes"
        DPSHomePage -> ExternalSystems "Accesses Contentful content"
        

    }
    views {

        systemContext DPSHomePage "DPSHomePage" {
            include *
            autoLayout
        }


        container NOMIS "NOMIS" {
            include *
            autoLayout
        }

        container HMPPSDigitalServices "HMPPSDigitalServices" {
            include *
            autoLayout
        }


    styles {

            element "Software System" {
                background #1168bd
                color #ffffff
            }

            element "Legacy System" {
                background #cccccc
                color #000000
            }  
            element "External System" {
                background #3598EE
                color #000000
            }             
            element "Person" {
                shape person
                background #08427b
                color #ffffff
            }

            element "NOMIS DB" {
                shape Cylinder
                background #cccccc
                color #000000
            }
        
        }
    }
}