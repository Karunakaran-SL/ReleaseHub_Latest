
import clientPromise from '@/lib/mongodb';
import { generateAndStoreAllProductTrees } from '@/lib/dependency-graph';
import type { Product, CmdbTenant, CmdbComponent, CmdbApplication, CmdbInterfaceType, CmdbInterface, OnboardingConfiguration, OnboardingPhase, License, ProductLicensing, Specification, Deployment, Simulator, Emulator, DevelopmentEnvironment, TestEnvironment, SdkApp, Baseline } from './definitions';

const appCatalogData = [
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Airship",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/airship.svg",
    "website": "https://www.airshipit.org/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Akri",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/akri.svg",
    "website": "https://docs.akri.sh",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Ansible",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/ansible.svg",
    "website": "https://www.ansible.com/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Apollo",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/apollo-1.svg",
    "website": "https://www.apolloconfig.com/",
    "description": "Apollo is a reliable open-source configuration management system"
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Atlantis",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/atlantis.svg",
    "website": "https://www.runatlantis.io/",
    "description": "Terraform Pull Request Automation for Teams"
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "AWS CloudFormation",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/aws-cloudformation.svg",
    "website": "https://aws.amazon.com/cloudformation/",
    "description": "AWS CloudFormation provides a common language for you to describe and provision all the infrastructure resources in your cloud environment."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "BOSH",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/cloudfoundry-bosh.svg",
    "website": "https://bosh.io/docs/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Cadence Workflow",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/cadenceworkflow.svg",
    "website": "https://cadenceworkflow.io/",
    "description": "Cadence is a distributed, scalable, durable, and highly available fault-oblivious stateful code platform."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "CDK for Kubernetes (CDK8s)",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/cdk8s.svg",
    "website": "https://cdk8s.io/",
    "description": "CDK8s lets you define Kubernetes apps and components using familiar programming languages and object-oriented APIs."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "CFEngine",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/cf-engine.svg",
    "website": "https://cfengine.com/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Chaterm",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/chaterm.svg",
    "website": "https://chaterm.ai/",
    "description": "AI terminal and SSH Client for EC2, Database and Kubernetes."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Chef Infra",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/chef_infra.svg",
    "website": "https://www.chef.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Cloud Custodian",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/cloud-custodian.svg",
    "website": "https://cloudcustodian.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Cloudify",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/cloudify.svg",
    "website": "https://cloudify.co",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Couler",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/couler.svg",
    "website": "https://couler-proj.github.io/couler/index.html",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "DevStream",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/devstream.svg",
    "website": "https://www.devstream.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Foreman",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/foreman.svg",
    "website": "https://theforeman.org/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Goose",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/goose.svg",
    "website": "https://block.github.io/goose/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Gthulhu",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/gthulhu.svg",
    "website": "https://gthulhu.github.io/docs/",
    "description": "Gthulhu optimizes cloud-native workloads using the Linux Scheduler Extension for different application scenarios."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Idem Project",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/idem-project.svg",
    "website": "https://www.idemproject.io",
    "description": "Idem reduces your cloud configuration to data – for you! Instead of Infrastructure as Code, Idem delivers Infrastructure as Data. The cloud becomes simplified, easier to maintain, easier to discover, and easier to use."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Juju",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/juju.svg",
    "website": "https://jaas.ai/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "kagent",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kagent.svg",
    "website": "https://kagent.dev/",
    "description": "Kagent is an open source programming framework designed for DevOps and platform engineers to run AI agents in Kubernetes"
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Kairos",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kairos.svg",
    "website": "https://kairos.io",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Kapitan",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kapitan.svg",
    "website": "https://kapitan.dev/",
    "description": "A configuration management system for platform engineering and other things"
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "KCL",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kcl.svg",
    "website": "https://kcl-lang.io/",
    "description": "A constraint-based record & functional language mainly used in configuration and policy scenarios."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "KitOps",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kitops.svg",
    "website": "https://kitops.org/",
    "description": "An open standard for packaging, managing, and deploying ML models and artifacts across different systems"
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "kiosk",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kiosk.svg",
    "website": "https://github.com/loft-sh/kiosk",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Kosko",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kosko.svg",
    "website": "https://kosko.dev",
    "description": "Kosko can help you organize your Kubernetes manifests in TypeScript, manage multiple environments, ensure type safety using OpenAPI schema, and find issues in your manifests."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "kpt",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kpt.svg",
    "website": "https://kpt.dev",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Kratix",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kratix.svg",
    "website": "https://www.kratix.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Kubean",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubean.svg",
    "website": "https://kubean-io.github.io/kubean/",
    "description": "Product ready cluster lifecycle management toolchains based on kubespray and other cluster LCM engine."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "KubeDL",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubedl.svg",
    "website": "https://kubedl.io",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "KubeEdge",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kube-edge.svg",
    "website": "https://kubeedge.io/en/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Kubefirst",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubefirst.svg",
    "website": "https://docs.kubefirst.com",
    "description": "Instant operational open source gitops platforms for platform engineering, infrastructure, and software teams"
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "KubeZoo",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubezoo.svg",
    "website": "https://kubewharf.github.io",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "KusionStack",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kusionstack.svg",
    "website": "https://kusionstack.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "LinuxKit",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/linux-kit.svg",
    "website": "https://github.com/linuxkit/linuxkit",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "MAAS",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/maas.svg",
    "website": "https://maas.io/",
    "description": "Self-service, remote installation of Windows, CentOS, ESXi and Ubuntu on real servers turns your data center into a bare-metal cloud."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "ManageIQ",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/manage-iq.svg",
    "website": "https://www.manageiq.org/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Meshery",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/meshery.svg",
    "website": "https://meshery.io",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Metal³",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/metal3.svg",
    "website": "https://metal3.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Mist.io",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/mistio.svg",
    "website": "https://mist.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Omni",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/omni.svg",
    "website": "https://siderolabs.com/omni",
    "description": "Omni is a Kubernetes orchestrator for bare metal and edge environments. It manages full OS and Kubernetes lifecycles with Talos Linux and remote management with wireguard communication."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "OpenStack",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/open-stack.svg",
    "website": "https://www.openstack.org/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "OpenTofu",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/opentofu.svg",
    "website": "https://opentofu.org/",
    "description": "OpenTofu is an open source infrastructure as code tool that enables users to safely and predictably provision and manage cloud and on-prem infrastructure. It's a community-driven fork of Terraform that maintains backward compatibility while offering enhanced features, stability."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "OpenYurt",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/openyurt.svg",
    "website": "https://openyurt.io/",
    "description": "An open platform that extending your native Kubernetes to edge."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Project Syn",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/projectsyn.svg",
    "website": "https://syn.tools/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Pulumi",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/pulumi.svg",
    "website": "https://www.pulumi.com/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Puppet",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/puppet.svg",
    "website": "https://puppet.com/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Runme Notebooks",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/cncf.svg",
    "website": "https://runme.dev/",
    "description": "A toolchain that turns Markdown into interactive, cloud-native, runnable Notebook experiences for DevOps."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Rundeck",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/rundeck.svg",
    "website": "https://www.rundeck.com/open-source",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Salt Project",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/salt-project.svg",
    "website": "https://saltproject.io",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "SDC",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/sdc.svg",
    "website": "https://docs.sdcio.dev/",
    "description": "SDC (schema Driven Configuration) exposes any schema based configuration as Kubernetes resources."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Shifu",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/shifu.svg",
    "website": "https://shifu.dev/",
    "description": "Shifu is the next generation cloud native IoT development framework that could 10X your IoT software development"
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "SuperEdge",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/superedge.svg",
    "website": "https://superedge.io/",
    "description": "An edge-native container management system for edge computing"
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Terraform",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/terraform.svg",
    "website": "https://www.terraform.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Terranetes",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/terranetes.svg",
    "website": "https://www.appvia.io/terranetes",
    "description": "The Appvia Terranetes Controller manages the life-cycle of Terraform and OpenTofu resources defined and built inside Kubernetes. This allows teams running workloads inside the cluster to self-serve application dependencies and reuse the wealth of Terraform modules already written."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Tinkerbell",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/tinkerbell.svg",
    "website": "https://tinkerbell.org/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "Updatecli",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/updatecli.svg",
    "website": "https://www.updatecli.io/",
    "description": "Updatecli is a declarative dependency management tool for Git repositories."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "VMware vSphere",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/vmware-vsphere.svg",
    "website": "https://www.vmware.com/products/vsphere.html",
    "description": "vSphere is the industry-leading server virtualization software and the heart of a modern SDDC, helping you run, manage, connect, and secure your applications in a common operating environment across clouds."
  },
  {
    "category": "Provisioning",
    "subcategory": "Automation & Configuration",
    "name": "XOAP",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/xoap_plain.svg",
    "website": "https://xoap.io/",
    "description": "Hybrid IT infrastructure and workplace automation platform"
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "Alibaba Cloud Container Registry (ACR)",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/alibaba-cloud-container-registry.svg",
    "website": "https://www.alibabacloud.com/zh/product/container-registry",
    "description": "Alibaba Cloud Container Registry (ACR) is a cloud-native artifacts management platform that helps your team build, manage, and ship containerized applications, also provides vulnerability analysis, global synchronization, content trust, and more functionalities out of the box."
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "Amazon Elastic Container Registry (ECR)",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/amazon-ecr.svg",
    "website": "https://aws.amazon.com/ecr/",
    "description": "Amazon Elastic Container Registry (ECR) is a fully-managed Docker container registry that makes it easy for developers to store, manage, and deploy Docker container images."
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "Azure Registry",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/azure-registry.svg",
    "website": "https://azure.microsoft.com/en-us/services/container-registry/",
    "description": "Azure Container Registry allows you to store images for all types of container deployments including DC/OS, Docker Swarm, Kubernetes, and Azure services such as App Service, Batch, Service Fabric, and others."
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "Distribution",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/distribution.svg",
    "website": "https://github.com/distribution/distribution",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "Dragonfly",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/dragonfly.svg",
    "website": "https://d7y.io/",
    "description": "Delivers efficient, stable, and secure data distribution and acceleration powered by P2P technology, with an optional content‑addressable filesystem that accelerates OCI container launch."
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "Google Container Registry",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/google-container-registry.svg",
    "website": "https://cloud.google.com/container-registry/",
    "description": "Container Registry is a single place for your team to manage Docker images, perform vulnerability analysis, and decide who can access what with fine-grained access control."
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "Harbor",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/harbor.svg",
    "website": "https://goharbor.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "IBM Cloud Container Registry",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/ibm-cloud-container-registry.svg",
    "website": "https://www.ibm.com/cloud/container-registry",
    "description": "Detect vulnerabilities before images are ever deployed to containers. Store and distribute Docker images in your managed private registry."
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "Cloudsmith",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/cloudsmith.svg",
    "website": "https://cloudsmith.com/",
    "description": "A single source of truth for every artifact and container. Cloudsmith is a powerful, cloud native, enterprise-grade artifact management solution."
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "JFrog Artifactory",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/j-frog-artifactory.svg",
    "website": "https://jfrog.com/artifactory/",
    "description": "Shipping updates continuously and automatically has become a critical element of any successful operation. JFrog is revolutionizing the software world with the practice of Continuous Update, with a speed and continuity that forever changes the way organizations manage and release software."
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "Kraken",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kraken.svg",
    "website": "https://eng.uber.com/introducing-kraken/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "Quay",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/quay.svg",
    "website": "https://quay.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "Spegel",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/spegel.svg",
    "website": "https://spegel.dev/",
    "description": "Stateless cluster local OCI registry mirror. Spegel enables each node in a Kubernetes cluster to act as a local registry mirror, allowing nodes to share images between themselves. Any image already pulled by a node will be available for any other node in the cluster to pull."
  },
  {
    "category": "Provisioning",
    "subcategory": "Container Registry",
    "name": "zot",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/zot.svg",
    "website": "https://zotregistry.dev/",
    "description": "Zot is an OCI-native container registry for distributing container images and OCI artifacts."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Airlock",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/airlock.svg",
    "website": "https://www.airlock.com/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Alcide",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/alcide.svg",
    "website": "https://github.com/alcideio",
    "description": "Alcide provides dev-to-production security for workloads running in Kubernetes & Istio"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "APIClarity",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/APIClarity.svg",
    "website": "https://openclarity.io/",
    "description": "APIClarity is a cloud API observability open-source project that provides functionality to discover and monitor any API traffic that interacts with modern applications and report suspected security weaknesses or possible abuses. Once an OpenAPI spec is either uploaded or reconstructed by APIClarity, it monitors for shadow and zombie APIs, Broken Functional-Level Authorization (BFLA), Broken Object-Level Authorization (BOLA), weak authentication, sensitive data leaks and data injection risks."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Apolicy",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/apolicy.svg",
    "website": "https://www.apolicy.io/",
    "description": "Apolicy fuses security and compliance into your cloud native development pipeline. Using policy-as-code,  we automate risk, policy and remediation from source to production"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Aqua",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/aqua.svg",
    "website": "https://www.aquasec.com/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "ARMO",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/armo.svg",
    "website": "https://www.armosec.io",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Aserto",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/aserto.svg",
    "website": "https://www.aserto.com",
    "description": "Fine-grained, policy-based, real-time authorization for APIs and microservices. Aserto is the maintainer of the Topaz and Open Policy Containers OSS projects."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "authentik",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/authentik.svg",
    "website": "https://goauthentik.io/",
    "description": "authentik is an open-source Identity Provider that emphasizes flexibility and versatility, with support for a wide set of protocols."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Bank-Vaults",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/bank-vaults.svg",
    "website": "https://bank-vaults.dev/",
    "description": "Bank-Vaults is a Vault swiss-army knife: a K8s operator, Go client with automatic token renewal, automatic configuration, multiple unseal options and more. A CLI tool to init, unseal and configure Vault (auth methods, secret engines). Direct secret injection into Pods."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Black Duck",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/blackduck.svg",
    "website": "https://www.synopsys.com/software-integrity/security-testing/software-composition-analysis.html",
    "description": "Black Duck provides a comprehensive software composition analysis (SCA) solution for managing security, quality, and license compliance risk that comes from the use of open source and third-party code in applications and containers."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Bloombase",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/bloombase.svg",
    "website": "https://www.bloombase.com",
    "description": "Bloombase is an intelligent storage firewall company providing AI-accelerated security and PQC encryption of high-bandwidth, low-latency data cloud from edge computing, physical/virtual datacenters, through HCI and CDI, to the cloud."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Bouncy Castle",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/community-bouncy-castle.svg",
    "website": "https://www.bouncycastle.org/",
    "description": "Bouncy Castle is one of the most widely used FIPS-certified open-source cryptographic APIs for Java and C#, allowing developers to easily integrate  PKI security into their applications."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Boundary",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/Hashicorp-Boundary.svg",
    "website": "https://www.boundaryproject.io/",
    "description": "Boundary is designed to grant access to critical systems using the principle of least privilege, solving challenges organizations encounter when users need to securely access applications and machines."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "bpfman",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/bpfman_logo.svg",
    "website": "https://bpfman.io/",
    "description": "An eBPF Manager for Linux and Kubernetes"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Capsule8",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/capsule8.svg",
    "website": "https://capsule8.com/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Cartography",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/cartography.svg",
    "website": "https://cartography.dev",
    "description": "Cartography is a Python tool that consolidates infrastructure assets and the relationships between them in an intuitive graph view."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Cerbos",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/cerbos.svg",
    "website": "https://www.cerbos.dev/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "cert-manager",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/jetstack-cert-manager.svg",
    "website": "https://cert-manager.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Chaitin Tech",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/ChaitinTech LOGO.svg",
    "website": "https://www.chaitin.cn/en/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Check Point",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/checkpoint.svg",
    "website": "https://www.checkpoint.com",
    "description": "Check Point Software Technologies Ltd. is a leading provider of cyber security solutions to corporate enterprises and governments globally. Check Point protects over 100,000 organizations of all sizes."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Checkov",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/checkov.svg",
    "website": "https://www.checkov.io/",
    "description": "Checkov scans cloud infrastructure configurations to find misconfigurations before they are deployed. Checkov manages and analyzes infrastructure as code (IaC) scan results across platforms such as Terraform, CloudFormation, Kubernetes, Helm, ARM Templates and Serverless framework."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Chef InSpec",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/chef_inspec.svg",
    "website": "https://community.chef.io/tools/chef-inspec",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Clair",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/clair.svg",
    "website": "https://www.redhat.com/en/topics/containers/what-is-clair",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "CloudMatos",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/cloudmatos.svg",
    "website": "https://www.cloudmatos.com",
    "description": "Pioneering the world of self-healing, self-aware, self-sustaining, self-resilient, self-secure and intelligent remediation, MatosSphere brings a complete cloud security and governance solution for your cloud infrastructure."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Confidential Containers",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/confidential-containers.svg",
    "website": "https://confidentialcontainers.org/",
    "description": "Confidential Containers is an open source community working to enable cloud native  confidential computing by leveraging Trusted Execution Environments to protect  containers and data."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "ContainerSSH",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/containerssh.svg",
    "website": "https://containerssh.io",
    "description": "ContainerSSH launches a new container for each SSH connection in Kubernetes, Podman or Docker. The user is transparently dropped in the container and the container is removed when the user disconnects. Authentication and container configuration are dynamic using webhooks, no system users required."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Copa",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/copa.svg",
    "website": "https://github.com/project-copacetic/copacetic",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Curiefense",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/curiefense.svg",
    "website": "https://www.curiefense.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "China Mobile Cloud Cloud-native Application Security",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/china-mobile-cloud-cas.svg",
    "website": "https://ecloud.10086.cn/portal/product/cnappsec",
    "description": "China Mobile Cloud Cloud-native Application Security is an application protection platform based on container technology, providing comprehensive security detection and protection capabilities for cloud-native environments."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Datica",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/datica.svg",
    "website": "https://www.linkedin.com/company/datica-inc/about/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Dex",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/dex.svg",
    "website": "https://dexidp.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Dosec",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/dosec.svg",
    "website": "https://www.dosec.cn/",
    "description": "Dosec Security Platform provides security protection capabilities for containers, kubernetes, microservices, serverless, and DevOps."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "EJBCA Community",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/ejbca-community.svg",
    "website": "https://www.ejbca.org/",
    "description": "Issue certificates for all your Kubernetes workloads with the open-source public key infrastructure (PKI) and certificate authority (CA) software EJBCA."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "external-secrets",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/external-secrets.svg",
    "website": "https://external-secrets.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Fairwinds Insights",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/fairwinds-insights.svg",
    "website": "https://fairwinds.com/insights",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Falco",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/falco.svg",
    "website": "https://falco.org/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "FOSSA",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/fossa.svg",
    "website": "https://fossa.com/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "FOSSID",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/fossid.svg",
    "website": "https://www.fossid.com/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Fugue",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/fugue.svg",
    "website": "https://www.fugue.co",
    "description": "Fugue empowers cloud engineering and security teams to move faster with confidence in their cloud security. Use Fugue to secure the entire development lifecycle—from infrastructure as code through CI/CD and runtime—using a unified policy engine powered by the Open Policy Agent (OPA), the open source standard for policy as code."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "GitGuardian",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/gitguardian.svg",
    "website": "https://www.gitguardian.com/",
    "description": "GitGuardian is the code security platform for the DevOps generation that offers automated Secrets Detection, Infra as Code Security,  and Honeytoken capabilities, facilitating a Secure Software Development Lifecycle for Dev, Sec, and Ops teams."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Goldilocks",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/goldilocks.svg",
    "website": "https://www.fairwinds.com/open-source-software",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Grafeas",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/grafeas.svg",
    "website": "https://grafeas.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Grype",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/grype.svg",
    "website": "https://github.com/anchore/grype",
    "description": "A vulnerability scanner for container images and filesystems"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Hexa",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/hexa.svg",
    "website": "https://hexaorchestration.org/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "in-toto",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/in-toto.svg",
    "website": "https://in-toto.io",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Keycloak",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/keycloak.svg",
    "website": "https://www.keycloak.org/",
    "description": "Keycloak is an open-source identity and access management solution for modern applications and services,  built on top of industry security standard protocols."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Keylime",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/keylime.svg",
    "website": "https://keylime.dev/",
    "description": "Bootstrap & Maintain Trust on the Edge / Cloud and IoT."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "KICS",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kics.svg",
    "website": "https://kics.io/",
    "description": "Find security vulnerabilities, compliance issues, and infrastructure misconfigurations early in the development cycle of your infrastructure-as-code with KICS by Checkmarx."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "kube-bench",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kube-bench.svg",
    "website": "https://github.com/aquasecurity/kube-bench",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "kube-hunter",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kube-hunter.svg",
    "website": "https://github.com/aquasecurity/kube-hunter",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "KubeArmor",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubearmor.svg",
    "website": "https://kubearmor.io/",
    "description": "Runtime protection for Kubernetes & other cloud Workloads. Kubearmor provides a observability and policy enforcement system to restrict any unwanted, malicious behaviour of cloud-native workloads at runtime."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "KubeLinter",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubelinter.svg",
    "website": "https://docs.kubelinter.io/",
    "description": "KubeLinter analyzes Kubernetes YAML files and Helm charts, and checks them against a variety of best practices, with a focus on production readiness and security."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Kubescape",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubescape.svg",
    "website": "https://kubescape.io/",
    "description": "Kubescape is an open source security and compliance platform that scans clusters, Kubernetes manifest files (YAML files, and Helm charts), code repositories, container registries and images. It detects misconfigurations according to frameworks such as the NSA-CISA,  MITRE ATT&CK® and CIS, as well as software vulnerabilities, and calculates risk scores."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Kubewarden",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kubewarden.svg",
    "website": "https://www.kubewarden.io",
    "description": "Kubewarden is a Policy Engine powered by WebAssembly policies. Its policies can be written in CEL, Rego (OPA & Gatekeeper flavours), Rust, Go, YAML, and others. Kubewarden simplifies Policy-As-Code by allowing policy authors and consumers to use their preferred tooling and stack, develop and test policies out of cluster. "
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Kyverno",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/kyverno.svg",
    "website": "https://kyverno.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Matano",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/matano.svg",
    "website": "https://www.matano.dev",
    "description": "Open source security lake platform for AWS"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Metarget",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/metarget.svg",
    "website": "https://github.com/Metarget/metarget",
    "description": "Metarget is a framework providing automatic constructions of vulnerable cloud native infrastructures."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Mondoo",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/mondoo.svg",
    "website": "https://mondoo.com",
    "description": "Cloud native infrastructure security for your entire fleet"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "MoreSec",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/moresec logo.svg",
    "website": "https://www.moresec.cn/",
    "description": "Moresec Shangfu Cloud Native Protection Platform is a security protection model based on the concept of cloud native. In view of the characteristics  of cloud native application life-cycle, it involves in many stages of security protection, including R&D construction, security testing, image  control, container deployment, container operation, etc. Shangfu also integrates security with development which means providing feedback of the  application security condition through correlating operation asset, and promoting the iteration and upgrade of application. Whereupon, a closed  loop of efficient cloud native application security risk is created, covering the whole stages of DevSecOps."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "NeuVector",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/neuvector.svg",
    "website": "https://neuvector.com/",
    "description": "NeuVector Full Lifecycle Container Security Platform delivers the only cloud-native security with uncompromising end-to-end protection from DevOps vulnerability protection to automated run-time security, and featuring a true Layer 7 container firewall."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Nirmata Cloud Native Policy Manager",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/nirmata.svg",
    "website": "https://www.nirmata.com/",
    "description": "The solution enables DevSecOps teams to ensure the security, compliance, and operational readiness of their Kubernetes workloads and clusters. By automating the creation, deployment, and lifecycle management of policy-based Intelligent Guardrails, customers can gain insights, alerts, and reports, and enable effective collaboration across development and operations teams."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Notary Project",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/notary-project.svg",
    "website": "https://notaryproject.dev/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Open Policy Administration Layer (OPAL)",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/opal.svg",
    "website": "https://www.opal.ac",
    "description": "Policy and data administration, distribution, and real-time updates on top of Policy Agents (OPA, Cedar, ...)"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "OAuth2 Proxy",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/oauth2-proxy.svg",
    "website": "https://oauth2-proxy.github.io/oauth2-proxy/",
    "description": "A generic reverse proxy that provides authentication with Google, Azure, OpenID Connect and many more identity providers."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Open Policy Agent (OPA)",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/opa.svg",
    "website": "https://www.openpolicyagent.org/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Open Policy Containers",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/open-policy-containers.svg",
    "website": "https://openpolicycontainers.com",
    "description": "A docker-inspired CLI for building, tagging, pushing, pulling, and signing OPA policies to and from OCI-compliant registries."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "OpenFGA",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/openfga.svg",
    "website": "https://openfga.dev",
    "description": "OpenFGA is a high performance and flexible authorization/permission system built for developers and inspired by Google Zanzibar"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "OpenSCAP",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/openscap.svg",
    "website": "https://www.open-scap.org/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "OSCAL-COMPASS",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/oscal-compass-color-stacked.svg",
    "website": "https://github.com/oscal-compass/community",
    "description": "The OSCAL COMPASS project is set of tools that enable the creation, validation, and governance of documentation artifacts for compliance needs. It leverages NIST's OSCAL (Open Security Controls Assessment Language) as a standard data format for interchange between tools and people, and provides an opinionated approach to OSCAL SDK and adoption by policy engines."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Orca Security",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/orcasec.svg",
    "website": "https://orca.security",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Oxeye",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/oxeye.svg",
    "website": "https://oxeye.io",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Paladin Cloud",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/paladin-cloud.svg",
    "website": "https://paladincloud.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Paralus",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/paralus.svg",
    "website": "https://www.paralus.io/",
    "description": "Paralus is a free, open source tool that enables controlled, audited access to Kubernetes infrastructure and Zero trust Kubernetes with zero friction."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Parsec",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/parsec.svg",
    "website": "https://parsec.community/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Passage",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/passage.svg",
    "website": "https://passage.id",
    "description": "Passage makes it easy for developers to implement passwordless customer identity in any application."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Permify",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/permify.svg",
    "website": "https://permify.co",
    "description": "Permify is an open-source authorization as a service inspired by Google Zanzibar, designed to build and manage fine-grained and scalable authorization systems for any application."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Permit.io",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/permit.io.svg",
    "website": "https://www.permit.io",
    "description": "Permit.io provides fine-grained authorization as a service (Policy-as-Code,  APIs, and customer facing UI), so developers can check this as done and focus on their core product. Permit.io is the maintainer of the OPAL (Open Policy Administration Layer) project."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Pluto",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/pluto.svg",
    "website": "https://www.fairwinds.com/open-source-software",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Polaris",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/polaris.svg",
    "website": "https://fairwinds.com/polaris",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Pomerium",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/pomerium.svg",
    "website": "https://www.pomerium.com/",
    "description": "Pomerium is an identity-aware access proxy that enables teams to implement true zero-trust security, eliminating the need for a VPN. Pomerium ensures that every single call is authenticated and authorized, providing a secure and seamless user experience."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Portshift",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/portshift.svg",
    "website": "https://github.com/Portshift",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Prisma Cloud",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/prisma-cloud-palo-alto.svg",
    "website": "https://www.paloaltonetworks.com/prisma/cloud",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Qingteng",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/qingteng.svg",
    "website": "https://qingteng.cn/",
    "description": "Qingteng Honeycomb · Container Security Platform can display risk scenarios visually for enterprises through continuous monitoring and analysis of the container security status, and protects the container environment during the entire life cycle (build, ship, and run) of the container."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "RAD Security",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/rad-security.svg",
    "website": "https://rad.security/",
    "description": "RAD Security maps a broad set of cluster components across the Kubernetes lifecycle  using a real-time graph, cutting noise in half through contextualized risks, highest impact remediations and Kubernetes-first  incident response."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Ratify",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/ratify.svg",
    "website": "https://ratify.dev/",
    "description": "A verification engine on Kubernetes which enables verification of artifact security metadata and admits for deployment only those that comply with policies you create."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "RBAC Lookup",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/rbac-lookup.svg",
    "website": "https://www.fairwinds.com/open-source-software",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "RBAC Manager",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/rbac-manager.svg",
    "website": "https://www.fairwinds.com/open-source-software",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Rudder",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/rudder.svg",
    "website": "https://www.rudder.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Scribe Security Platform",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/scribe-logo.svg",
    "website": "https://scribesecurity.com",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "secureCodeBox",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/secureCodeBox.svg",
    "website": "https://www.securecodebox.io/",
    "description": "secureCodeBox is an OWASP project providing an automated and scalable open source solution that integrates multiple security scanners with a simple and lightweight interface – for continuous and automated security testing."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "SignServer Community",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/signserver-community.svg",
    "website": "https://www.signserver.org/",
    "description": "Sign code, containers, and attestations and create timestamps with the open-source, x509 certificate-based signing software SignServer."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "sigstore",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/sigstore.svg",
    "website": "https://www.sigstore.dev/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "SlimToolkit",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/slimtoolkit.svg",
    "website": "https://slimtoolkit.org/",
    "description": "Inspect, Optimize and Debug Your Containers"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Snyk",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/snyk.svg",
    "website": "https://snyk.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Sonatype",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/sonatype.svg",
    "website": "https://www.sonatype.com",
    "description": "Sonatype is the developer-friendly full-spectrum software supply, chain management platform helps organizations and software developers. One of the Sonatype products includes the open source software repository manager Sonatype Nexus Repository."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Sonobuoy",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/project-sonobuoy.svg",
    "website": "https://sonobuoy.io",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "SOPS",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/sops.svg",
    "website": "https://github.com/getsops",
    "description": "sops is an editor of encrypted files that supports YAML, JSON, ENV, INI and BINARY formats and encrypts with AWS KMS, GCP KMS, Azure Key Vault, age, and PGP."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Spyderbat",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/spyderbat.svg",
    "website": "https://www.spyderbat.com/",
    "description": "Spyderbat provides Linux runtime security, protecting dynamic environments by proactively tracking all user activities by their causal connections to detect and resolve external attacks, misconfigurations, and insider threats."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "sso",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/sso.svg",
    "website": "https://github.com/buzzfeed/sso",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "StackHawk",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/stackhawk.svg",
    "website": "https://www.stackhawk.com/index.html",
    "description": "StackHawk helps developers find and fix application security vulnerabilities before they hit production with CI/CD automation."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "StackRox",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/stackrox.svg",
    "website": "https://www.stackrox.io/",
    "description": "StackRox is a Kubernetes-native security platform for cloud-native applications, containers, serverless, and Kubernetes."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Syft",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/syft.svg",
    "website": "https://github.com/anchore/syft",
    "description": "Syft is a CLI tool and library for generating a Software Bill of Materials from container images and filesystems"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Sysdig Secure",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/sysdig-secure.svg",
    "website": "https://sysdig.com/use-cases/kubernetes-security",
    "description": "Sysdig Secure embeds security and compliance into the build, run and respond stages of the Kubernetes lifecycle._"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Teleport",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/teleport.svg",
    "website": "https://goteleport.com",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Tensor Security",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/tensor.svg",
    "website": "https://www.tensorsecurity.cn",
    "description": "Tensor Security is a cloud-native security company focused on providing AI-based and full-stack cloud-native security solutions."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Terrascan",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/terrascan.svg",
    "website": "https://www.tenable.com/products/tenable-cs",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Tesseral",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/tesseral.svg",
    "website": "https://www.tesseral.com/",
    "description": "Tesseral is the open source platform for managing identity and access in business software."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Tetragon",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/tetragon-logo-wormark.svg",
    "website": "https://github.com/cilium/tetragon",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "The Update Framework (TUF)",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/the-update-framework-tuf.svg",
    "website": "https://theupdateframework.github.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "ThreatMapper",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/threatmapper.svg",
    "website": "https://deepfence.io/threatmapper/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Tigera",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/tigera.svg",
    "website": "https://www.tigera.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Tokenetes",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/tokenetes.svg",
    "website": "https://tokenetes.io/",
    "description": "Tokenetes implements Transaction Tokens (TraTs) for microservices call chains. It's a Kubernetes-native framework providing immutable identity and context in service-to-service communication to prevent attacks like software supply chain or privileged user compromise."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Topaz",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/topaz.svg",
    "website": "https://www.topaz.sh",
    "description": "Cloud-native authorization for modern applications and APIs, combining the best of Open Policy Agent and Google Zanzibar"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Tracee",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/tracee.svg",
    "website": "https://aquasecurity.github.io/tracee/latest/",
    "description": "Tracee helps you understand your systems and applications behavior, and apply runtime security to them. It uses Linux eBPF technology and strong security techniques to instrument the system and expose relevant events for you to consume and process."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Trend Micro Cloud One",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/trend-micro.svg",
    "website": "https://www.trendmicro.com/en_us/business/campaigns/cloud-one-services.html",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Trivy",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/trivy.svg",
    "website": "https://trivy.dev",
    "description": "Trivy is an all-in-one security scanner that beings vulnerability, SBOM, misconfigurations, leaked secrets, and license scanning together, across container images, code repositories, Kubernetes clusters and more."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "vArmor",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/varmor.svg",
    "website": "https://varmor.org",
    "description": "vArmor is a cloud-native container sandbox system. It leverages Linux's AppArmor LSM, BPF LSM and Seccomp technologies to implement enforcers. It can be used to strengthen container isolation, reduce the kernel attack surface, and increase the difficulty and cost of container escape or lateral movement attacks. It includes multiple built-in protection rules that are ready to use out of the box."
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Veinmind Tools",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/veinmind.svg",
    "website": "https://veinmind.chaitin.com/",
    "description": "veinmind-tools is self-developed by chaitin technology, cloudwalker team incubation, a container security toolset based on veinmind-sdk"
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "WhiteSource",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/white-source.svg",
    "website": "https://www.whitesourcesoftware.com/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Zettaset",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/zettaset.svg",
    "website": "https://www.zettaset.com/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Security & Compliance",
    "name": "Zitadel",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/zitadel.svg",
    "website": "https://zitadel.com/",
    "description": "ZITADEL is the identity infrastructure, simplified for you."
  },
  {
    "category": "Provisioning",
    "subcategory": "Key Management",
    "name": "Athenz",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/athenz.svg",
    "website": "https://www.athenz.io",
    "description": "Open source platform for X.509 certificate based service authentication and fine grained access control in dynamic infrastructures"
  },
  {
    "category": "Provisioning",
    "subcategory": "Key Management",
    "name": "Authing",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/authing.svg",
    "website": "https://www.authing.cn",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Key Management",
    "name": "CyberArk Conjur",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/conjur.svg",
    "website": "https://www.conjur.org",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Key Management",
    "name": "ORY Hydra",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/ory-hydra.svg",
    "website": "https://www.ory.sh/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Key Management",
    "name": "Pinniped",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/pinniped.svg",
    "website": "https://pinniped.dev",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Key Management",
    "name": "SPIFFE",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/spiffe.svg",
    "website": "https://spiffe.io/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Key Management",
    "name": "SPIRE",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/spire.svg",
    "website": "https://spiffe.io/spire/",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Key Management",
    "name": "Teller",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/teller.svg",
    "website": "https://tlr.dev",
    "description": ""
  },
  {
    "category": "Provisioning",
    "subcategory": "Key Management",
    "name": "Vault",
    "logo": "https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/vault.svg",
    "website": "https://www.vaultproject.io/",
    "description": ""
  }
];

const initialSpecHypervisors = [{ name: 'VMWare ESXi' }, { name: 'Microsoft Hyper-V' }, { name: 'KVM' }, { name: 'Harvester' }];

const initialSimulators: Omit<Simulator, '_id'>[] = [
  { name: 'High-Latency WAN Simulator', dockerImage: 'slow-network/wan-sim:latest', helmChartUrl: 'charts/wan-simulator' },
  { name: 'Packet-Loss Network Simulator (5%)', dockerImage: 'fault-injector/packet-loss:5.0' },
  { name: 'CPU Stress Test Simulator', dockerImage: 'stress-ng/cpu-burner:latest' },
  { name: 'Disk I/O Bottleneck Simulator', dockerImage: 'fio/io-simulator:latest' },
];

const initialEmulators: Omit<Emulator, '_id'>[] = [
  { name: 'Raspberry Pi 4 (QEMU)', dockerImage: 'qemu/raspi4-emulator:latest', registryUrl: 'docker.io', helmChartUrl: '' },
  { name: 'HPE ProLiant DL380 Gen11', dockerImage: 'hpe-sim/dl380-g11:latest', registryUrl: 'registry.hpe.com' },
  { name: 'Cisco Nexus 9000v Switch', dockerImage: 'cisco/nexus9000v:latest', registryUrl: 'registry.cisco.com' },
  { name: 'Android 14 Emulator', dockerImage: 'google/android-emulator:14.0', registryUrl: 'gcr.io' },
];

const initialProducts: Omit<Product, '_id' | 'created_at' | 'updated_at'>[] = [
  {
    "name": "OneStopShop Portal",
    "owner": "Platform Engineering", "owner_email": "platform@example.com",
    "product_image": "https://picsum.photos/seed/product1/400/400",
    "approval_needed": true,
    "default_workflow": { "id": "StandardApproval", "name": "Standard Approval" },
    "custom_workflows": [],
    "compliance_checks": [{ "id": "SOC2", "name": "SOC2" }, { "id": "GDPR", "name": "GDPR" }],
    "deployment_type": { "id": "Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/oss-portal",
    "artifacts_repo": "http://artifacts.example.com/oss-portal",
    "pipeline": "http://cicd.example.com/oss-portal",
    "specifications": [{ "id": "ArgoCDSyncSpec", "name": "ArgoCD Sync Spec" }, { "id": "SingleSignOnSpec", "name": "Single Sign-On Spec" }],
    "version": "1.0.0",
  },
  {
    "name": "Unified Data Fabric",
    "owner": "Data Platform Team", "owner_email": "data-platform@example.com",
    "product_image": "https://picsum.photos/seed/product2/400/400",
    "approval_needed": true,
    "default_workflow": { "id": "DataGovernanceReview", "name": "Data Governance Review" },
    "custom_workflows": [],
    "compliance_checks": [{ "id": "HIPAA", "name": "HIPAA" }],
    "deployment_type": { "id": "Cloud", "name": "Cloud" },
    "git_repo": "http://git.example.com/platform/data-fabric",
    "artifacts_repo": "http://artifacts.example.com/data-fabric",
    "pipeline": "http://cicd.example.com/data-fabric",
    "specifications": [{ "id": "DellPowerEdgeR760", "name": "Dell PowerEdge R760" }],
    "version": "1.1.0",
  }
];

const initialServiceContracts = [
    { id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus', description: '24/7 premium hardware and software support.'},
    { id: 'ServiceContract_Foundation_Care', name: 'Foundation Care', description: 'Basic hardware support.'},
    { id: 'CommunitySupport', name: 'Community Support', description: 'Community-based support for open-source software.'}
];

const fullSpecifications: Omit<Specification, '_id'>[] = [
    {
        name: 'ArgoCD Sync Spec', vendor: 'CNCF', hw_type: { id: 'Virtual', name: 'Virtual' }, hypervisor: { id: 'KVM', name: 'KVM'}, service_contract_type: { id: 'CommunitySupport', name: 'Community Support' },
        clusterName: 'ArgoCD Management Cluster',
        nodeCount: { controlPlane: 3, worker: 5 },
        image: 'https://picsum.photos/seed/spec1/400/400',
        nodes: [
            ...Array.from({ length: 3 }, (_, i) => ({
                vmName: `argo-cp-${i+1}`,
                role: 'Control Plane' as const,
                cpuCores: 8, memory: 32, diskSize: 200, osType: 'Ubuntu 22.04 LTS',
                networkInterface: 'Virtual_VLAN_802.1Q', connectivity: 'Private' as const, dns: 'internal.corp',
                ssh: { username: 'admin', sshKey: 'ssh-rsa AAAAB3Nza... controlplane-key' }
            })),
            ...Array.from({ length: 5 }, (_, i) => ({
                vmName: `argo-worker-${i+1}`,
                role: 'Worker' as const,
                cpuCores: 16, memory: 64, diskSize: 500, osType: 'Ubuntu 22.04 LTS',
                networkInterface: 'Virtual_VXLAN', connectivity: 'Private' as const, dns: 'internal.corp',
                ssh: { username: 'admin', sshKey: 'ssh-rsa AAAAB3NzaC... worker-key' }
            }))
        ],
    },
    {
        name: 'Single Sign-On Spec', vendor: 'OpenID', hw_type: { id: 'Virtual', name: 'Virtual' }, hypervisor: { id: 'VMWare ESXi', name: 'VMWare ESXi' }, service_contract_type: { id: 'CommunitySupport', name: 'Community Support' },
        clusterName: 'SSO Authentication Service',
        image: 'https://picsum.photos/seed/spec2/400/400',
        nodeCount: { controlPlane: 2, worker: 3 },
        nodes: [
            ...Array.from({ length: 2 }, (_, i) => ({
                vmName: `sso-cp-${i+1}`, role: 'Control Plane' as const, cpuCores: 4, memory: 16, diskSize: 100, osType: 'RHEL 9',
                networkInterface: 'Virtual_VLAN_802.1Q', connectivity: 'Private' as const, dns: 'auth.corp',
                ssh: { username: 'sso_admin', sshKey: 'ssh-rsa AAAAB3NzaC... sso-cp-key' }
            })),
            ...Array.from({ length: 3 }, (_, i) => ({
                vmName: `sso-worker-${i+1}`, role: 'Worker' as const, cpuCores: 8, memory: 32, diskSize: 250, osType: 'RHEL 9',
                networkInterface: 'Virtual_VLAN_802.1Q', connectivity: 'Private' as const, dns: 'auth.corp',
                ssh: { username: 'sso_admin', sshKey: 'ssh-rsa AAAAB3NzaC... sso-worker-key' }
            }))
        ],
    },
    {
        name: 'Dell PowerEdge R760', vendor: 'Dell EMC', hw_type: { id: 'Rack', name: 'Rack' }, service_contract_type: {id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus'},
        total_cpu: 64, memory_gb: 256, storage_gb: 4096, image: 'https://picsum.photos/seed/spec3/400/400',
        network_cards: [{id: 'Ethernet_10G_SFP+', name: 'Ethernet_10G_SFP+'}], plug_power_cords: [{id: 'C13/C14', name: 'C13/C14'}],
        hypervisor: { id: 'VMWare ESXi', name: 'VMWare ESXi' }, biosVersion: "2.10.1", firmwareVersion: "7.00.10.00 (iDRAC 9)", cpuArchitecture: "x86_64", virtualizationSupport: true,
        iloCredentials: { username: 'root', password: 'password123' }, timeSync: 'ntp.dell.com', raidConfiguration: 'RAID 1 (OS), RAID 5 (Data)',
        diskLayout: { osDisk: '2x 480GB SSD', dataDisk: '8x 2TB SAS HDD' }, sshKeys: 'ssh-rsa AAAAB3NzaC... r760-admin-key'
    },
    {
        name: 'HPE ProLiant DL380 Gen11', vendor: 'HPE', hw_type: { id: 'Rack', name: 'Rack' }, service_contract_type: {id: 'ServiceContract_Foundation_Care', name: 'Foundation Care'},
        total_cpu: 48, memory_gb: 192, storage_gb: 2048, image: 'https://picsum.photos/seed/spec4/400/400',
        biosVersion: "U52 v1.50", firmwareVersion: "3.01 (iLO 6)", cpuArchitecture: "x86_64", virtualizationSupport: true,
        iloCredentials: { username: 'admin', password: 'password' }, timeSync: 'time.nist.gov', raidConfiguration: 'RAID 1 (OS), RAID 6 (Data)',
        diskLayout: { osDisk: '2x 480GB SSD', dataDisk: '6x 1.2TB SAS HDD' }
    },
    {
        name: 'Cisco UCS B200 M7 Blade', vendor: 'Cisco', hw_type: { id: 'Blade', name: 'Blade'}, service_contract_type: {id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus'},
        image: 'https://picsum.photos/seed/spec5/400/400',
        symmetric: true, bladeCount: 8,
        blades: [{
            name: 'Blade Template', cpuType: 'Intel Xeon Scalable', cpuCores: 24, memory: 128, diskType: 'SSD_NVMe_U2_PCIeGen4', diskCapacity: 1024, hasGpu: true, gpuType: 'NVIDIA A100', gpuCores: 108,
            networkInterfaces: [{name: 'vic1520', type: 'Ethernet_40G_QSFP+', speed: '40Gbps'}]
        }],
        biosVersion: "S52.4.1.0.1", firmwareVersion: "5.0(2)", virtualizationSupport: true
    },
    {
        name: 'Asymmetric Blade Server', vendor: 'Lenovo', hw_type: { id: 'Blade', name: 'Blade'}, service_contract_type: {id: 'ServiceContract_ProSupport_Plus', name: 'ProSupport Plus'},
        image: 'https://picsum.photos/seed/spec6/400/400',
        symmetric: false, bladeCount: 4,
        blades: [
            { name: 'Compute-Blade-1', cpuType: 'AMD EPYC 7002', cpuCores: 32, memory: 256, diskType: 'SSD_NVMe_U2_PCIeGen4', diskCapacity: 2048, hasGpu: false },
            { name: 'Compute-Blade-2', cpuType: 'AMD EPYC 7002', cpuCores: 32, memory: 256, diskType: 'SSD_NVMe_U2_PCIeGen4', diskCapacity: 2048, hasGpu: false },
            { name: 'Storage-Blade-1', cpuType: 'Intel Xeon Scalable', cpuCores: 16, memory: 128, diskType: 'HDD_3.5inch_SAS_15KRPM', diskCapacity: 16384, hasGpu: false },
            { name: 'GPU-Blade-1', cpuType: 'Intel Xeon Scalable', cpuCores: 52, memory: 512, diskType: 'SSD_NVMe_U2_PCIeGen4', diskCapacity: 4096, hasGpu: true, gpuType: 'NVIDIA H100', gpuCores: 108 }
        ]
    },
    {
      "name": "Spec-hardware-Blade-1763392192219",
      "hw_type": { "id": "Blade", "name": "Blade"},
      "image": "https://picsum.photos/seed/spec7/400/400",
      "symmetric": false,
      "bladeCount": 1,
      "blades": [
        {
          "name": "Blade 1", "cpuType": "AMD Ryzen 9", "cpuCores": 12, "memory": 64, "diskType": "SSD_SATA_2.5inch", "diskCapacity": 2048,
          "hasGpu": true, "gpuType": 'NVIDIA GeForce RTX 4080', "gpuCores": 9728
        }
      ]
    }
];

const initialTenants: Omit<CmdbTenant, '_id'| 'created_at' | 'updated_at'>[] = [
    { id: 'CorePlatformServices', name: 'Core Platform Services', description: 'Holds core infrastructure components.', version: '2.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}, {id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}] },
    { id: 'CustomerAnalytics', name: 'Customer Analytics', description: 'Tenant for customer-facing analytics dashboards.', version: '1.5.0', products: [{id: 'UnifiedDataFabric', name: 'Unified DataFabric'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}] },
    { id: 'RetailOperations', name: 'Retail Operations', description: 'Manages retail and e-commerce services.', version: '1.2.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}] },
    { id: 'SupplyChainLogistics', name: 'Supply Chain Logistics', description: 'Tenant for SCM and logistics.', version: '3.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'RetailOperations', name: 'Retail Operations', version: '1.2.0'}] },
    { id: 'MarketingAutomation', name: 'Marketing Automation', description: 'Handles marketing campaigns and user outreach.', version: '1.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics', version: '1.5.0'}] },
    { id: 'FraudDetection', name: 'Fraud Detection', description: 'Real-time fraud detection services.', version: '2.1.0', products: [{id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}] },
    { id: 'BillingAndPayments', name: 'Billing and Payments', description: 'Handles all financial transactions.', version: '4.0.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}] },
    { id: 'HumanResources', name: 'Human Resources', description: 'Internal HR systems.', version: '1.8.0', products: [{id: 'OneStopShopPortal', name: 'OneStopShop Portal'}] },
    { id: 'DataScienceWorkbench', name: 'Data Science Workbench', description: 'Environment for data scientists.', version: '1.3.0', products: [{id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], dependent_tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics', version: '1.5.0'}] },
    { id: 'IoTPlatform', name: 'IoT Platform', description: 'Platform for managing IoT devices.', version: '2.5.0', products: [{id: 'UnifiedDataFabric', name: 'Unified Data Fabric'}], dependent_tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services', version: '2.0.0'}] },
];

const initialComponents: Omit<CmdbComponent, '_id' | 'created_at' | 'updated_at'>[] = [
    { id: 'AuthNService', name: 'AuthN Service', version: '3.1.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], provided_interfaces: [{id: 'AuthNTokenAPI', name: 'AuthN Token API'}], phases: [] },
    { id: 'AuthZService', name: 'AuthZ Service', version: '2.5.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], provided_interfaces: [{id: 'AuthZCheckAPI', name: 'AuthZ Check API'}], dependent_interfaces: [{id: 'AuthNTokenAPI', name: 'AuthN Token API'}], phases: [] },
    { id: 'DataIngestor', name: 'Data Ingestor', version: '1.8.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], provided_interfaces: [{id: 'DataIngestTopic', name: 'Data Ingest Topic'}], phases: [] },
    { id: 'DataProcessor', name: 'Data Processor', version: '2.2.0', tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics'}], dependent_interfaces: [{id: 'DataIngestTopic', name: 'Data Ingest Topic'}], provided_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: [] },
    { id: 'ProductCatalog', name: 'Product Catalog', version: '4.0.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], provided_interfaces: [{id: 'ProductCatalogDB', name: 'Product Catalog DB'}], phases: [] },
    { id: 'InventoryService', name: 'Inventory Service', version: '3.5.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], dependent_interfaces: [{id: 'ProductCatalogDB', name: 'Product Catalog DB'}], provided_interfaces: [{id: 'InventoryCheckAPI', name: 'Inventory Check API'}], phases: [] },
    { id: 'ShippingCalculator', name: 'Shipping Calculator', version: '1.2.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], provided_interfaces: [{id: 'ShippingRateAPI', name: 'Shipping Rate API'}], phases: [] },
    { id: 'ShipmentTracker', name: 'Shipment Tracker', version: '2.0.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], provided_interfaces: [{id: 'ShipmentStatusAPI', name: 'Shipment Status API'}], phases: [] },
    { id: 'EmailService', name: 'Email Service', version: '5.1.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], provided_interfaces: [{id: 'SendEmailAPI', name: 'Send Email API'}], phases: [] },
    { id: 'PushNotificationService', name: 'Push Notification Service', version: '2.3.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], provided_interfaces: [{id: 'SendPushAPI', name: 'Send Push API'}], phases: [] },
    { id: 'RiskEngine', name: 'Risk Engine', version: '3.0.0', tenants: [{id: 'FraudDetection', name: 'Fraud Detection'}], dependent_interfaces: [{id: 'DataIngestTopic', name: 'Data Ingest Topic'}], provided_interfaces: [{id: 'FraudScoreAPI', name: 'Fraud Score API'}], phases: [] },
    { id: 'PaymentGateway', name: 'Payment Gateway', version: '6.2.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], provided_interfaces: [{id: 'ProcessPaymentAPI', name: 'Process Payment API'}], phases: [] },
    { id: 'InvoiceGenerator', name: 'Invoice Generator', version: '2.8.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], provided_interfaces: [{id: 'InvoiceAPI', name: 'Invoice API'}], phases: [] },
    { id: 'PayrollProcessor', name: 'Payroll Processor', version: '4.1.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], phases: [] },
    { id: 'BenefitsManager', name: 'Benefits Manager', version: '1.5.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], phases: [] },
    { id: 'JupyterHub', name: 'Jupyter Hub', version: '2.0.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], phases: [] },
    { id: 'MLModelServing', name: 'ML Model Serving', version: '1.7.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], dependent_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: [] },
    { id: 'DeviceRegistry', name: 'Device Registry', version: '3.2.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], provided_interfaces: [{id: 'DeviceRegistryAPI', name: 'Device Registry API'}], phases: [] },
    { id: 'MQTTBroker', name: 'MQTT Broker', version: '5.0.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], dependent_interfaces: [{id: 'DeviceRegistryAPI', name: 'Device Registry API'}], phases: [] },
    { id: 'TimeSeriesDB', name: 'Time Series DB', version: '2.9.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], phases: [] },
];

const initialApplications: Omit<CmdbApplication, '_id' | 'created_at' | 'updated_at'>[] = [
    { id: 'UserProfileApp', name: 'User Profile App', version: '1.5.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], dependent_interfaces: [{id: 'AuthNTokenAPI', name: 'AuthN Token API'}, {id: 'AuthZCheckAPI', name: 'AuthZ Check API'}], phases: [] },
    { id: 'AnalyticsDashboard', name: 'Analytics Dashboard', version: '2.1.0', tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics'}], dependent_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: [] },
    { id: 'RetailStorefront', name: 'Retail Storefront', version: '3.2.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], dependent_interfaces: [{id: 'ProductCatalogDB', name: 'Product Catalog DB'}, {id: 'InventoryCheckAPI', name: 'Inventory Check API'}, {id: 'ProcessPaymentAPI', name: 'ProcessPaymentAPI'}], phases: [] },
    { id: 'WarehouseManager', name: 'Warehouse Manager', version: '1.8.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], dependent_interfaces: [{id: 'InventoryCheckAPI', name: 'Inventory Check API'}, {id: 'ShipmentStatusAPI', name: 'Shipment Status API'}], phases: [] },
    { id: 'MarketingCampaignDashboard', name: 'Marketing Campaign Dashboard', version: '1.1.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], dependent_interfaces: [{id: 'SendEmailAPI', name: 'Send Email API'}, {id: 'SendPushAPI', name: 'Send Push API'}], phases: [] },
    { id: 'FraudAnalystConsole', name: 'Fraud Analyst Console', version: '2.4.0', tenants: [{id: 'FraudDetection', name: 'Fraud Detection'}], dependent_interfaces: [{id: 'FraudScoreAPI', name: 'Fraud Score API'}], phases: [] },
    { id: 'BillingDashboard', name: 'Billing Dashboard', version: '3.0.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], dependent_interfaces: [{id: 'InvoiceAPI', name: 'Invoice API'}], phases: [] },
    { id: 'EmployeePortal', name: 'Employee Portal', version: '2.5.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], dependent_interfaces: [], phases: [] },
    { id: 'DSModelBuilder', name: 'DS Model Builder', version: '1.9.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], dependent_interfaces: [], phases: [] },
    { id: 'DeviceProvisioner', name: 'Device Provisioner', version: '2.2.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], dependent_interfaces: [{id: 'DeviceRegistryAPI', name: 'Device Registry API'}], phases: [] },
    { id: 'AdminConsole', name: 'Admin Console', version: '1.0.0', tenants: [{id: 'CorePlatformServices', name: 'Core Platform Services'}], dependent_interfaces: [{id: 'AuthZCheckAPI', name: 'AuthZ Check API'}], phases: [] },
    { id: 'ReportGeneratorApp', name: 'Report Generator App', version: '1.2.0', tenants: [{id: 'CustomerAnalytics', name: 'Customer Analytics'}], dependent_interfaces: [{id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic'}], phases: [] },
    { id: 'ShoppingCartApp', name: 'Shopping Cart App', version: '2.5.0', tenants: [{id: 'RetailOperations', name: 'Retail Operations'}], dependent_interfaces: [{id: 'InventoryCheckAPI', name: 'Inventory Check API'}, {id: 'ProcessPaymentAPI', name: 'Process Payment API'}], phases: [] },
    { id: 'FleetManagementApp', name: 'Fleet Management App', version: '1.4.0', tenants: [{id: 'SupplyChainLogistics', name: 'Supply Chain Logistics'}], dependent_interfaces: [{id: 'ShipmentStatusAPI', name: 'Shipment Status API'}], phases: [] },
    { id: 'ABTestingApp', name: 'A/B Testing App', version: '1.0.0', tenants: [{id: 'MarketingAutomation', name: 'Marketing Automation'}], dependent_interfaces: [], phases: [] },
    { id: 'TransactionMonitor', name: 'Transaction Monitor', version: '3.1.0', tenants: [{id: 'FraudDetection', name: 'Fraud Detection'}], dependent_interfaces: [{id: 'FraudScoreAPI', name: 'Fraud Score API'}], phases: [] },
    { id: 'SubscriptionManager', name: 'Subscription Manager', version: '2.0.0', tenants: [{id: 'BillingAndPayments', name: 'Billing and Payments'}], dependent_interfaces: [{id: 'ProcessPaymentAPI', name: 'Process Payment API'}], phases: [] },
    { id: 'TimeOffManager', name: 'Time Off Manager', version: '1.3.0', tenants: [{id: 'HumanResources', name: 'Human Resources'}], dependent_interfaces: [], phases: [] },
    { id: 'FeatureStoreApp', name: 'Feature Store App', version: '1.1.0', tenants: [{id: 'DataScienceWorkbench', name: 'Data Science Workbench'}], dependent_interfaces: [], phases: [] },
    { id: 'DeviceMonitorDashboard', name: 'Device Monitor Dashboard', version: '2.0.0', tenants: [{id: 'IoTPlatform', name: 'IoT Platform'}], dependent_interfaces: [], phases: [] },
];

const initialInterfaces: Omit<CmdbInterface, '_id' | 'created_at' | 'updated_at'>[] = [
    { id: 'AuthNTokenAPI', name: 'AuthN Token API', type: { id: 'REST', name: 'REST API' }, version: 'v3', owner_name: 'Auth Team', owner_email: 'auth@example.com', source: { id: 'AuthNService', name: 'AuthN Service' }, security: { internal: { secure: true, authentication: false }, external: { secure: false, authentication: false } } },
    { id: 'AuthZCheckAPI', name: 'AuthZ Check API', type: { id: 'gRPC', name: 'gRPC Service' }, version: 'v2', owner_name: 'Auth Team', owner_email: 'auth@example.com', source: { id: 'AuthZService', name: 'AuthZ Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'DataIngestTopic', name: 'Data Ingest Topic', type: { id: 'KafkaTopic', name: 'Kafka Topic' }, version: 'v1', owner_name: 'Data Platform', owner_email: 'data-platform@example.com', source: { id: 'DataIngestor', name: 'Data Ingestor' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ProcessedAnalyticsTopic', name: 'Processed Analytics Topic', type: { id: 'KafkaTopic', name: 'Kafka Topic' }, version: 'v1', owner_name: 'Analytics Team', owner_email: 'analytics@example.com', source: { id: 'DataProcessor', name: 'Data Processor' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ProductCatalogDB', name: 'Product Catalog DB', type: { id: 'DatabaseConnection', name: 'Database Connection' }, version: 'v1', owner_name: 'Retail Team', owner_email: 'retail@example.com', source: { id: 'ProductCatalog', name: 'Product Catalog' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'InventoryCheckAPI', name: 'Inventory Check API', type: { id: 'REST', name: 'REST API' }, version: 'v2', owner_name: 'Retail Team', owner_email: 'retail@example.com', source: { id: 'InventoryService', name: 'Inventory Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ShippingRateAPI', name: 'Shipping Rate API', type: { id: 'GraphQL', name: 'GraphQL API' }, version: 'v1', owner_name: 'Logistics Team', owner_email: 'logistics@example.com', source: { id: 'ShippingCalculator', name: 'Shipping Calculator' }, security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } } },
    { id: 'ShipmentStatusAPI', name: 'Shipment Status API', type: { id: 'REST', name: 'REST API' }, version: 'v3', owner_name: 'Logistics Team', owner_email: 'logistics@example.com', source: { id: 'ShipmentTracker', name: 'Shipment Tracker' }, security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } } },
    { id: 'SendEmailAPI', name: 'Send Email API', type: { id: 'REST', name: 'REST API' }, version: 'v4', owner_name: 'Marketing Team', owner_email: 'marketing@example.com', source: { id: 'EmailService', name: 'Email Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'SendPushAPI', name: 'Send Push API', type: { id: 'REST', name: 'REST API' }, version: 'v2', owner_name: 'Marketing Team', owner_email: 'marketing@example.com', source: { id: 'PushNotificationService', name: 'Push Notification Service' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'FraudScoreAPI', name: 'Fraud Score API', type: { id: 'gRPC', name: 'gRPC Service' }, version: 'v3', owner_name: 'Security Team', owner_email: 'security@example.com', source: { id: 'RiskEngine', name: 'Risk Engine' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'ProcessPaymentAPI', name: 'Process Payment API', type: { id: 'REST', name: 'REST API' }, version: 'v5', owner_name: 'Billing Team', owner_email: 'billing@example.com', source: { id: 'PaymentGateway', name: 'Payment Gateway' }, security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } } },
    { id: 'InvoiceAPI', name: 'Invoice API', type: { id: 'GraphQL', name: 'GraphQL API' }, version: 'v2', owner_name: 'Billing Team', owner_email: 'billing@example.com', source: { id: 'InvoiceGenerator', name: 'Invoice Generator' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    { id: 'DeviceRegistryAPI', name: 'Device Registry API', type: { id: 'REST', name: 'REST API' }, version: 'v1', owner_name: 'IoT Team', owner_email: 'iot@example.com', source: { id: 'DeviceRegistry', name: 'Device Registry' }, security: { internal: { secure: true, authentication: true }, external: { secure: false, authentication: false } } },
    ...Array.from({ length: 36 }, (_, i) => ({
        id: `ExternalInterface${i + 1}`,
        name: `External Interface ${i + 1}`,
        type: { id: i % 2 === 0 ? 'GraphQL' : 'REST', name: i % 2 === 0 ? 'GraphQL API' : 'REST API' },
        version: `v1`,
        owner_name: `Partner Team ${i + 1}`,
        owner_email: `partner${i + 1}@example.com`,
        source: { id: `Application${(i % 20) + 1}`, name: `Application ${(i % 20) + 1}` },
        security: { internal: { secure: true, authentication: true }, external: { secure: true, authentication: true } },
    })),
];

const generateInitialLicenses = (): Omit<License, '_id'>[] => {
    const licenseTemplates = [
        { name: 'MIT', type: 'open-source', owner: 'MIT' },
        { name: 'Apache 2.0', type: 'open-source', owner: 'Apache Foundation' },
        { name: 'GPLv3', type: 'open-source', owner: 'FSF' },
        { name: 'BSD-3-Clause', type: 'open-source', owner: 'Various' },
        { name: 'React', type: 'open-source', owner: 'Facebook' },
        { name: 'Angular', type: 'open-source', owner: 'Google' },
        { name: 'Vue', type: 'open-source', owner: 'Evan You' },
        { name: 'MongoDB SSPL', type: 'proprietary', owner: 'MongoDB Inc.' },
        { name: 'Elastic License 2.0', type: 'proprietary', owner: 'Elastic' },
        { name: 'Confluent Community License', type: 'proprietary', owner: 'Confluent' },
        { name: 'Oracle Java SE', type: 'proprietary', owner: 'Oracle' },
        { name: 'Microsoft EULA', type: 'proprietary', owner: 'Microsoft' },
        { name: 'Datadog Subscription', type: 'subscription', owner: 'Datadog' },
        { name: 'Okta Identity', type: 'subscription', owner: 'Okta' },
        { name: 'JetBrains All-Products', type: 'subscription', owner: 'JetBrains' },
        { name: 'Windows Server 2022', type: 'perpetual', owner: 'Microsoft' },
        { name: 'VMware vSphere', type: 'perpetual', owner: 'VMware' },
    ];

    const allEntities = [...initialComponents, ...initialApplications];
    const licenses: Omit<License, '_id'>[] = [];
    let licenseCount = 0;

    licenseTemplates.forEach(template => {
        const licenseId = template.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        licenses.push({
            id: licenseId,
            name: template.name,
            type: template.type as any,
            owner: template.owner,
            status: 'active'
        });
        licenseCount++;
    });

    allEntities.forEach(entity => {
        const numLicenses = Math.floor(Math.random() * 3) + 1; // 1 to 3 licenses per entity
        for (let i = 0; i < numLicenses; i++) {
            const template = licenseTemplates[Math.floor(Math.random() * licenseTemplates.length)];
            const status = ['active', 'active', 'active', 'expired', 'deprecated'][Math.floor(Math.random() * 5)];
            const licenseId = `${template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${entity.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            
            const existing = licenses.find(l => l.id === licenseId);
            if (existing) continue;

            const newLicense: Omit<License, '_id'> = {
                id: licenseId,
                name: `${template.name} for ${entity.name}`,
                type: template.type as any,
                owner: template.owner,
                status: status as any,
                versions: [entity.version], // Link to a specific version
            };
            
            if ('tenants' in entity && entity.tenants) {
                newLicense.tenants = entity.tenants.map(t => t.id);
            }

            if ('dependent_components' in entity) { // It's a component or app
                 newLicense.components = [entity.id];
            } else {
                 newLicense.apps = [entity.id];
            }

            licenses.push(newLicense);
            licenseCount++;
        }
    });

    // Add some more generic ones to reach 100+
    while (licenseCount < 100) {
        const template = licenseTemplates[Math.floor(Math.random() * licenseTemplates.length)];
        const status = ['active', 'expired', 'deprecated'][Math.floor(Math.random() * 3)];
        const id = `${template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-gen-${licenseCount}`;
         licenses.push({
            id: id,
            name: `${template.name} - General Purpose`,
            type: template.type as any,
            owner: template.owner,
            status: status as any
        });
        licenseCount++;
    }

    return licenses;
}

const initialLicenses = generateInitialLicenses();


const initialProductLicensing: Omit<ProductLicensing, '_id'>[] = [
    { id: 'pl-oss-portal', product_id: 'OneStopShopPortal', license_model: 'hybrid', entitlements: ['feature-sso', 'feature-dashboard'], package_included: true, validity: 'perpetual', compliance: 'ISO 27001' },
    { id: 'pl-data-fabric', product_id: 'UnifiedDataFabric', license_model: 'online', entitlements: ['feature-streaming', 'feature-batch'], package_included: false, validity: '2025-12-31', compliance: 'SOC 2 Type II' }
];

const initialPlatformFoundations: any[] = [
    ...initialSpecHypervisors.map(hypervisor => ({
        _id: `DellR760-${hypervisor.name.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: `Dell R760 with ${hypervisor.name}`,
        createdAt: new Date().toISOString(),
        createdBy: 'seed',
        specification: fullSpecifications.find(s => s.name === 'Dell PowerEdge R760'),
        hypervisor: { id: hypervisor._id, name: hypervisor.name },
        virtual_machines: [
            ...Array.from({ length: 3 }, (_, i) => ({ vmName: `dell-cp-${i+1}`, role: 'Control Plane', cpuCores: 8, memory: 32, diskSize: 200, osType: 'Ubuntu 22.04 LTS', networkInterface: 'Ethernet_10G_SFP+', connectivity: 'Private', dns: 'dell.internal', ssh: { username: 'ubuntu', sshKey: 'ssh-rsa...' }})),
            ...Array.from({ length: 10 }, (_, i) => ({ vmName: `dell-w-${i+1}`, role: 'Worker', cpuCores: 16, memory: 64, diskSize: 500, osType: 'Ubuntu 22.04 LTS', networkInterface: 'Ethernet_10G_SFP+', connectivity: 'Private', dns: 'dell.internal', ssh: { username: 'ubuntu', sshKey: 'ssh-rsa...' }})),
        ],
        kubernetes: {
            distribution: 'rke2',
            cniPlugin: 'cilium',
            controlPlaneNodes: Array.from({ length: 3 }, (_, i) => ({ id: `dell-cp-${i+1}`, label: `dell-cp-${i+1}` })),
            workerNodes: Array.from({ length: 10 }, (_, i) => ({ id: `dell-w-${i+1}`, label: `dell-w-${i+1}` })),
        }
    })),
    ...initialSpecHypervisors.map(hypervisor => ({
        _id: `CiscoBlade-${hypervisor.name.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: `Cisco Blade Cluster on ${hypervisor.name}`,
        createdAt: new Date().toISOString(),
        createdBy: 'seed',
        specification: fullSpecifications.find(s => s.name === 'Cisco UCS B200 M7 Blade'),
        hypervisor: { id: hypervisor._id, name: hypervisor.name },
        virtual_machines: [
            ...Array.from({ length: 3 }, (_, i) => ({ vmName: `cisco-cp-${i+1}`, role: 'Control Plane', cpuCores: 4, memory: 16, diskSize: 100, osType: 'RHEL 9', networkInterface: 'Ethernet_40G_QSFP+', connectivity: 'Private', dns: 'cisco.internal', ssh: { username: 'ec2-user', sshKey: 'ssh-rsa...' }})),
            ...Array.from({ length: 5 }, (_, i) => ({ vmName: `cisco-w-${i+1}`, role: 'Worker', cpuCores: 8, memory: 32, diskSize: 200, osType: 'RHEL 9', networkInterface: 'Ethernet_40G_QSFP+', connectivity: 'Private', dns: 'cisco.internal', ssh: { username: 'ec2-user', sshKey: 'ssh-rsa...' }})),
        ],
        kubernetes: {
            distribution: 'k3s',
            cniPlugin: 'calico',
            controlPlaneNodes: Array.from({ length: 3 }, (_, i) => ({ id: `cisco-cp-${i+1}`, label: `cisco-cp-${i+1}` })),
            workerNodes: Array.from({ length: 5 }, (_, i) => ({ id: `cisco-w-${i+1}`, label: `cisco-w-${i+1}` })),
        }
    })),
    {
        _id: `ArgoCD-VirtualFoundation`,
        name: `ArgoCD Virtual Foundation`,
        createdAt: new Date().toISOString(),
        createdBy: 'seed',
        specification: fullSpecifications.find(s => s.name === 'ArgoCD Sync Spec'),
        hypervisor: { id: 'KVM', name: 'KVM' },
        virtual_machines: fullSpecifications.find(s => s.name === 'ArgoCD Sync Spec')?.nodes,
        kubernetes: {
            distribution: 'rke2',
            clusterCidr: '10.42.0.0/16',
            serviceCidr: '10.43.0.0/16',
            dnsDomain: 'argo.cluster.local',
            cniPlugin: 'canal',
            useCustomCerts: false,
            controlPlaneNodes: fullSpecifications.find(s => s.name === 'ArgoCD Sync Spec')?.nodes?.filter(n => n.role === 'Control Plane').map(n => ({ id: n.vmName, label: n.vmName })),
            workerNodes: fullSpecifications.find(s => s.name === 'ArgoCD Sync Spec')?.nodes?.filter(n => n.role === 'Worker').map(n => ({ id: n.vmName, label: n.vmName })),
        }
    },
    {
        _id: `SSO-VirtualFoundation`,
        name: `SSO Virtual Foundation`,
        createdAt: new Date().toISOString(),
        createdBy: 'seed',
        specification: fullSpecifications.find(s => s.name === 'Single Sign-On Spec'),
        hypervisor: { id: 'VMWare ESXi', name: 'VMWare ESXi' },
        virtual_machines: fullSpecifications.find(s => s.name === 'Single Sign-On Spec')?.nodes,
        kubernetes: {
            distribution: 'k3s',
            clusterCidr: '10.62.0.0/16',
            serviceCidr: '10.63.0.0/16',
            dnsDomain: 'sso.cluster.local',
            cniPlugin: 'calico',
            useCustomCerts: true,
            controlPlaneNodes: fullSpecifications.find(s => s.name === 'Single Sign-On Spec')?.nodes?.filter(n => n.role === 'Control Plane').map(n => ({ id: n.vmName, label: n.vmName })),
            workerNodes: fullSpecifications.find(s => s.name === 'Single Sign-On Spec')?.nodes?.filter(n => n.role === 'Worker').map(n => ({ id: n.vmName, label: n.vmName })),
        }
    }
];

const initialDevEnvironments: Omit<DevelopmentEnvironment, '_id'>[] = [
    { name: 'Feature Branch - SSO', productId: 'OneStopShopPortal', productName: 'OneStopShop Portal', specificationId: 'ArgoCDSyncSpec', specName: 'ArgoCD Sync Spec', baselineId: 'OneStopShopPortal_1.0.0', tenantIds: [], createdAt: '2024-06-01T10:00:00.000Z', createdBy: 'dev-user-1', status: 'READY', estimatedCost: 15.50, resourceUsage: { cpu: '8 vCPU', memory: '32 GB', storage: '200 GB' } },
    { name: 'Analytics Hotfix', productId: 'UnifiedDataFabric', productName: 'Unified Data Fabric', specificationId: 'DellPowerEdgeR760', specName: 'Dell PowerEdge R760', baselineId: undefined, tenantIds: ['CustomerAnalytics'], createdAt: '2024-06-05T14:30:00.000Z', createdBy: 'dev-user-2', status: 'PROVISIONING', estimatedCost: 25.00, resourceUsage: { cpu: '16 vCPU', memory: '64 GB', storage: '500 GB' } },
];

const initialTestEnvironments: Omit<TestEnvironment, '_id'>[] = [
    { name: 'Q3 Performance Run', productId: 'UnifiedDataFabric', productName: 'Unified Data Fabric', specificationId: 'CiscoUCSB200M7Blade', specName: 'Cisco UCS B200 M7 Blade', baselineId: 'UnifiedDataFabric_1.1.0', createdAt: '2024-05-20T10:00:00.000Z', createdBy: 'qa-user-1', status: 'READY', estimatedCost: 50.00, resourceUsage: { cpu: '32 vCPU', memory: '128 GB', storage: '1TB' } },
    { name: 'Retail E2E Testbed', productId: 'OneStopShopPortal', productName: 'OneStopShop Portal', specificationId: 'HPEProLiantDL380Gen11', specName: 'HPE ProLiant DL380 Gen11', baselineId: undefined, tenantIds: ['RetailOperations', 'SupplyChainLogistics'], createdAt: '2024-06-10T11:00:00.000Z', createdBy: 'qa-user-2', status: 'ERROR', estimatedCost: 50.00, resourceUsage: { cpu: '32 vCPU', memory: '128 GB', storage: '1TB' } },
];

const initialSdkApps: Omit<SdkApp, '_id'| 'createdAt'>[] = [
    {
        projectName: 'supply-chain-logistics-app',
        group: 'com.example.supplychain',
        dependencies: [
            { id: 'sql-postgres', name: 'SQL Database (PostgreSQL)', description: 'Adds JDBC driver and configuration for PostgreSQL.', group: 'Databases' },
            { id: 'messaging-kafka', name: 'Messaging (Kafka)', description: 'Adds Spring for Kafka for producing/consuming messages.', group: 'Messaging' },
            { id: 'web-react', name: 'Web Portal (React)', description: 'Generates a React frontend structure.', group: 'Web' },
        ],
        repoUrl: 'https://github.com/example/supply-chain-app.git',
        pipelineType: 'gitlab',
        environmentType: 'development',
        environmentId: initialDevEnvironments.find(e => e.name === 'Feature Branch - SSO')?._id, // This will be assigned dynamically later if needed
        tenantId: 'SupplyChainLogistics',
        status: 'READY',
        version: '1.0.0',
        createdBy: 'seed-user',
        simulators: [
            {
                id: initialSimulators.find(s => s.name === 'High-Latency WAN Simulator')!._id,
                name: 'High-Latency WAN Simulator',
                instanceCount: 2,
                instances: [
                    { name: 'wan-sim-us', ip: '10.1.1.5', user: 'admin', pass: 'pass' },
                    { name: 'wan-sim-eu', ip: '10.2.1.5', user: 'admin', pass: 'pass' },
                ]
            }
        ],
        emulators: [
             {
                id: initialEmulators.find(s => s.name === 'Raspberry Pi 4 (QEMU)')!._id,
                name: 'Raspberry Pi 4 (QEMU)',
                instanceCount: 1,
                instances: [
                    { name: 'rpi-sensor-1', ip: '192.168.1.101', user: 'pi', pass: 'raspberry' }
                ]
            }
        ]
    },
    {
        projectName: 'analytics-dashboard-v2',
        group: 'com.example.analytics',
        dependencies: [
            { id: 'nosql-mongodb', name: 'NoSQL Database (MongoDB)', description: 'Adds MongoDB driver and Spring Data MongoDB.', group: 'Databases' },
            { id: 'web-angular', name: 'Web Portal (Angular)', description: 'Generates an Angular frontend structure.', group: 'Web' },
            { id: 'monitoring-prometheus', name: 'Monitoring (Prometheus)', description: 'Exposes application metrics for Prometheus scraping.', group: 'Observability' },
        ],
        repoUrl: 'https://github.com/example/analytics-dashboard.git',
        pipelineType: 'github',
        environmentType: 'test',
        environmentId: initialTestEnvironments.find(e => e.name === 'Q3 Performance Run')?._id,
        tenantId: 'CustomerAnalytics',
        status: 'PROVISIONING',
        version: '2.0.0',
        createdBy: 'seed-user',
        simulators: [
            {
                id: initialSimulators.find(s => s.name === 'CPU Stress Test Simulator')!._id,
                name: 'CPU Stress Test Simulator',
                instanceCount: 3,
                instances: [
                    { name: 'cpu-stress-1', ip: '10.3.1.1', user: 'root', pass: '' },
                    { name: 'cpu-stress-2', ip: '10.3.1.2', user: 'root', pass: '' },
                    { name: 'cpu-stress-3', ip: '10.3.1.3', user: 'root', pass: '' },
                ]
            }
        ],
        emulators: []
    }
];

const initialBaselines: Omit<Baseline, '_id'>[] = [
    {
        product: { id: "OneStopShopPortal", name: "OneStopShop Portal", version: "1.0.0" },
        specifications: [{ id: "ArgoCDSyncSpec", name: "ArgoCD Sync Spec", version: "1.0.0" }],
        tenants: initialTenants.filter(t => t.products?.some(p => p.id === 'OneStopShopPortal')),
        status: 'RELEASED',
        created_at: new Date('2023-10-26T10:00:00Z').toISOString(),
        updated_at: new Date('2023-11-01T12:00:00Z').toISOString(),
        created_by: 'release-manager',
        artifacts: [{ name: 'onestopshop-1.0.0.zip', url: '#', size: '128 MB' }],
        package_properties: { location: 's3://releases/onestopshop/1.0.0', checksum_md5: 'mock-md5-sum', checksum_sha256: 'mock-sha256-sum' }
    },
    {
        product: { id: "UnifiedDataFabric", name: "Unified Data Fabric", version: "1.1.0" },
        specifications: [{ id: "DellPowerEdgeR760", name: "Dell PowerEdge R760", version: "1.0.0" }],
        tenants: initialTenants.filter(t => t.products?.some(p => p.id === 'UnifiedDataFabric')),
        status: 'RELEASED',
        created_at: new Date('2024-01-15T10:00:00Z').toISOString(),
        updated_at: new Date('2024-01-20T12:00:00Z').toISOString(),
        created_by: 'release-manager',
        artifacts: [{ name: 'datafabric-1.1.0.zip', url: '#', size: '256 MB' }],
        package_properties: { location: 's3://releases/datafabric/1.1.0', checksum_md5: 'mock-md5-sum', checksum_sha256: 'mock-sha256-sum' }
    },
     {
        product: { id: "UnifiedDataFabric", name: "Unified Data Fabric", version: "1.2.0-draft" },
        specifications: [{ id: "DellPowerEdgeR760", name: "Dell PowerEdge R760", version: "1.0.0" }],
        tenants: initialTenants.filter(t => t.products?.some(p => p.id === 'UnifiedDataFabric')),
        status: 'DRAFT',
        created_at: new Date('2024-06-15T10:00:00Z').toISOString(),
        updated_at: new Date('2024-06-15T12:00:00Z').toISOString(),
        created_by: 'dev-user',
        artifacts: [{ name: 'datafabric-1.2.0-draft.zip', url: '#', size: '260 MB' }],
        package_properties: { location: 's3://releases/datafabric/1.2.0-draft', checksum_md5: 'mock-md5-sum', checksum_sha256: 'mock-sha256-sum' }
    }
];

const generateDeployments = (): Omit<Deployment, '_id'>[] => {
    const data: Omit<Deployment, '_id'>[] = [];
    const customers = ['Innovate Inc.', 'Solutions Corp', 'Synergy LLC', 'Quantum Enterprises', 'Apex Industries', 'Starlight Logistics'];
    const countries = ['United States', 'Germany', 'Japan', 'Brazil', 'Australia', 'South Africa', 'United Kingdom', 'France', 'India', 'Canada'];
    const statuses: Deployment['status'][] = ['ACTIVE', 'PROVISIONING', 'UPGRADING', 'FAILED', 'UPGRADE_APPROVAL', 'ACTIVE', 'ACTIVE'];
    
    for (let i = 0; i < 50; i++) {
        const product = initialProducts[i % initialProducts.length];
        const spec = fullSpecifications[i % fullSpecifications.length];
        const customer = customers[i % customers.length];
        const country = countries[i % countries.length];
        const status = statuses[i % statuses.length];
        const date = new Date(2024, i % 12, (i % 28) + 1);

        data.push({
            productId: product.name.replace(/[^a-zA-Z0-9]/g, ''),
            specificationId: spec.name.replace(/[^a-zA-Z0-9]/g, ''),
            hypervisorId: 'KVM',
            foundationComponentIds: [],
            security: {},
            details: {
                deploymentId: `DEP-${(2000 + i).toString()}`,
                customer: customer,
                country: country,
                region: 'Americas' // Simplified for example
            },
            createdBy: 'seed-user',
            createdAt: date.toISOString(),
            status: status
        });
    }
    return data;
};

const initialDeployments = generateDeployments();


const initialWorkflows: { _id: string; id: string; name: string; description: string }[] = [
    { _id: 'StandardApproval', id: 'StandardApproval', name: 'Standard Approval', description: 'Default workflow with a single approval step.' },
    { _id: 'DataGovernanceReview', id: 'DataGovernanceReview', name: 'Data Governance Review', description: 'Workflow for data-sensitive products requiring governance review.' },
];

const initialComplianceChecks: { _id: string; id: string; name: string; description: string }[] = [
    { _id: 'SOC2', id: 'SOC2', name: 'SOC 2', description: 'Checks for SOC 2 compliance.' },
    { _id: 'GDPR', id: 'GDPR', name: 'GDPR', description: 'Checks for GDPR compliance.' },
    { _id: 'HIPAA', id: 'HIPAA', name: 'HIPAA', description: 'Checks for HIPAA compliance.' },
];

const initialDeploymentTypes: { _id: string; id: string; name: string; description: string }[] = [
    { _id: 'Cloud', id: 'Cloud', name: 'Cloud', description: 'Standard cloud deployment.' },
    { _id: 'Airgapped', id: 'Airgapped', name: 'Airgapped', description: 'Deployment in an environment with no external network access.' },
    { _id: 'OnPremise', id: 'OnPremise', name: 'On-Premise', description: 'Deployment on customer-managed hardware.' },
];

const initialInterfaceTypes: Omit<CmdbInterfaceType, '_id'>[] = [
  { id: 'REST', name: 'REST API', description: 'A standard RESTful API endpoint.' },
  { id: 'gRPC', name: 'gRPC Service', description: 'A high-performance RPC service.' },
  { id: 'KafkaTopic', name: 'Kafka Topic', description: 'A topic for asynchronous messaging.' },
  { id: 'DatabaseConnection', name: 'Database Connection', description: 'A direct database connection string or interface.' },
  { id: 'GraphQL', name: 'GraphQL API', description: 'A GraphQL API endpoint.' },
];

const generatePhases = (config: OnboardingConfiguration) => {
  return config.phases.map(phaseConfig => {
      const statuses = phaseConfig.statusOptions;
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      return {
          id: phaseConfig.id,
          name: phaseConfig.name,
          version: "1.0",
          status: randomStatus,
          fields: phaseConfig.fields.map(fieldConfig => ({
              name: fieldConfig.name,
              value: `Dummy value for ${fieldConfig.label}`,
              proof: { link: fieldConfig.proof ? `http://example.com/proof/${phaseConfig.id}/${fieldConfig.name}` : '' },
          })),
      };
  });
};

const initialSpecHypervisors = [{ name: 'VMWare ESXi' }, { name: 'Microsoft Hyper-V' }, { name: 'KVM' }, { name: 'Harvester' }];

const initialSimulators: Omit<Simulator, '_id'>[] = [
  { name: 'High-Latency WAN Simulator', dockerImage: 'slow-network/wan-sim:latest', helmChartUrl: 'charts/wan-simulator' },
  { name: 'Packet-Loss Network Simulator (5%)', dockerImage: 'fault-injector/packet-loss:5.0' },
  { name: 'CPU Stress Test Simulator', dockerImage: 'stress-ng/cpu-burner:latest' },
  { name: 'Disk I/O Bottleneck Simulator', dockerImage: 'fio/io-simulator:latest' },
];

const initialEmulators: Omit<Emulator, '_id'>[] = [
  { name: 'Raspberry Pi 4 (QEMU)', dockerImage: 'qemu/raspi4-emulator:latest', registryUrl: 'docker.io', helmChartUrl: '' },
  { name: 'HPE ProLiant DL380 Gen11', dockerImage: 'hpe-sim/dl380-g11:latest', registryUrl: 'registry.hpe.com' },
  { name: 'Cisco Nexus 9000v Switch', dockerImage: 'cisco/nexus9000v:latest', registryUrl: 'registry.cisco.com' },
  { name: 'Android 14 Emulator', dockerImage: 'google/android-emulator:14.0', registryUrl: 'gcr.io' },
];


export async function seedDatabase() {
    const client = await clientPromise;
    const db = client.db();

    const collectionsToSeed = [
        { name: 'products', data: initialProducts.map(p => ({...p, _id: p.name.replace(/[^a-zA-Z0-9]/g, ''), created_at: new Date().toISOString(), updated_at: new Date().toISOString()})) },
        { name: 'specifications', data: fullSpecifications.map(s => ({...s, _id: s.name.replace(/[^a-zA-Z0-9]/g, '') })) },
        { name: 'deployment_types', data: initialDeploymentTypes },
        { name: 'workflows', data: initialWorkflows.map(w => ({ ...w, _id: w.name.replace(/[^a-zA-Z0-9]/g, '') })) },
        { name: 'compliance_checks', data: initialComplianceChecks.map(c => ({...c, _id: c.name.replace(/[^a-zA-Z0-9]/g, '')})) },
        { name: 'cmdb_tenants', data: initialTenants.map(t => ({ ...t, _id: t.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phases: generatePhases(initialTenantOnboarding as OnboardingConfiguration) })) },
        { name: 'cmdb_components', data: initialComponents.map(c => ({ ...c, _id: c.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phases: generatePhases(initialComponentOnboarding as OnboardingConfiguration) })) },
        { name: 'cmdb_applications', data: initialApplications.map(a => ({ ...a, _id: a.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), phases: generatePhases(initialApplicationOnboarding as OnboardingConfiguration) })) },
        { name: 'cmdb_interface_types', data: initialInterfaceTypes.map(i => ({ ...i, _id: i.id })) },
        { name: 'cmdb_interfaces', data: initialInterfaces.map(i => ({ ...i, _id: i.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })) },
        { name: 'settings_application_onboarding', data: [initialApplicationOnboarding] },
        { name: 'settings_component_onboarding', data: [initialComponentOnboarding] },
        { name: 'settings_tenant_onboarding', data: [initialTenantOnboarding] },
        { name: 'settings_baseline_onboarding', data: [initialBaselineConfig] },
        { name: 'service_contracts', data: initialServiceContracts.map(s => ({...s, _id: s.id})) },
        { name: 'specification_vendors', data: initialSpecVendors },
        { name: 'specification_hw_types', data: initialSpecHwTypes },
        { name: 'specification_hypervisors', data: initialSpecHypervisors },
        { name: 'specification_network_cards', data: initialSpecNetworkCards },
        { name: 'specification_plug_power_cords', data: initialSpecPlugPowerCords },
        { name: 'specification_cpu_types', data: initialSpecCpuTypes },
        { name: 'specification_gpu_types', data: initialSpecGpuTypes },
        { name: 'specification_disk_types', data: initialSpecDiskTypes },
        ...initialApprovalConfigs,
        { name: 'licenses', data: initialLicenses.map(l => ({ ...l, _id: l.id })) },
        { name: 'product_licensing', data: initialProductLicensing.map(pl => ({ ...pl, _id: pl.id })) },
        { name: 'platform_foundations', data: initialPlatformFoundations },
        { name: 'development_environments', data: initialDevEnvironments },
        { name: 'test_environments', data: initialTestEnvironments },
        { name: 'simulators', data: initialSimulators },
        { name: 'emulators', data: initialEmulators },
        { name: 'sdk_apps', data: initialSdkApps.map(app => ({ ...app, createdAt: new Date().toISOString(), createdBy: 'seed-user' })) },
        { name: 'baselines', data: initialBaselines.map(b => ({ ...b, _id: `${b.product.id}_${b.product.version}` })) },
        { name: 'deployments', data: initialDeployments.map(d => ({ ...d, _id: d.details.deploymentId })) },
        { name: 'app_catalog', data: appCatalogData },
    ];
    
    let seededCount = 0;
    let skippedCount = 0;

    for (const collection of collectionsToSeed) {
        const collectionName = 'collectionName' in collection ? collection.collectionName : collection.name;
        const count = await db.collection(collectionName).countDocuments();
        if (count === 0) {
            await db.collection(collectionName).insertMany(collection.data as any[]);
            seededCount++;
        } else {
            skippedCount++;
        }
    }
    
    await generateAndStoreAllProductTrees();

    return { seededCount, skippedCount };
}

