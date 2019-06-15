/*
Copyright (c) Facebook, Inc. and its affiliates.
All rights reserved.

This source code is licensed under the BSD-style license found in the
LICENSE file in the root directory of this source tree.
*/

package registry

import (
	"log"
	platform_registry "magma/orc8r/cloud/go/registry"
	"magma/orc8r/cloud/go/service/serviceregistry"

	"google.golang.org/grpc"
)

const (
	ModuleName = "feg"

	CONTROL_PROXY = "CONTROL_PROXY"
	S6A_PROXY     = "S6A_PROXY"
	SESSION_PROXY = "SESSION_PROXY"
	SWX_PROXY     = "SWX_PROXY"
	HEALTH        = "HEALTH"
	CSFB          = "CSFB"
	FEG_HELLO     = "FEG_HELLO"
	AAA           = "AAA_SERVER"
	EAP           = "EAP"
	EAP_AKA       = "EAP_AKA"
	RADIUS        = "RADIUS"
	MOCK_VLR      = "MOCK_VLR"
	MOCK_OCS      = "MOCK_OCS"
	MOCK_PCRF     = "MOCK_PCRF"
	MOCK_HSS      = "HSS"

	SESSION_MANAGER = "SESSIOND"
)

// Add a new service.
// If the service already exists, overwrites the service config.
func AddService(serviceType, host string, port int) {
	platform_registry.AddService(platform_registry.ServiceLocation{Name: serviceType, Host: host, Port: port})
}

// Returns the RPC address of the service.
// The service needs to be added to the registry before this.
func GetServiceAddress(service string) (string, error) {
	return platform_registry.GetServiceAddress(service)
}

// Provides a gRPC connection to a service in the registry.
func GetConnection(service string) (*grpc.ClientConn, error) {
	return platform_registry.GetConnection(service)
}

func addLocalService(serviceType string, port int) {
	AddService(serviceType, "localhost", port)
}

func init() {
	// Add default Local Service Locations
	addLocalService(FEG_HELLO, 9093)
	addLocalService(SESSION_PROXY, 9097)
	addLocalService(S6A_PROXY, 9098)
	addLocalService(CSFB, 9101)
	addLocalService(HEALTH, 9107)

	addLocalService(RADIUS, 9108)
	addLocalService(EAP, 9109)
	addLocalService(AAA, 9109)
	addLocalService(EAP_AKA, 9123)
	addLocalService(SWX_PROXY, 9110)

	addLocalService(MOCK_OCS, 9201)
	addLocalService(MOCK_PCRF, 9202)
	addLocalService(MOCK_VLR, 9203)
	addLocalService(MOCK_HSS, 9204)

	// Overwrite/Add from /etc/magma/service_registry.yml if it exists
	// moduleName is "" since all feg configs lie in /etc/magma without a module name
	locations, err := serviceregistry.LoadServiceRegistryConfig("")
	if err != nil {
		log.Printf("Error loading FeG service_registry.yml: %v", err)
	} else if len(locations) > 0 {
		platform_registry.AddServices(locations...)
	}
}
