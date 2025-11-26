
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
    "description": "Issue certificates for all your Kubernetes workloads with the open-source public key infrastructure (PKI) and certificate authority (CA) software EJBCA. "
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

const initialOnboardingConfig = {
    _id: "default_tenant_onboarding_v1",
    name: 'Tenant Onboarding',
    version: 1,
    phases: [{
        id: 'phase1', name: 'Information Gathering', ownerName: 'John Doe', ownerEmail: 'john.doe@example.com', sendEmailOnComplete: true, statusOptions: ['Not Started', 'In Progress', 'Done'],
        fields: [{ type: 'TextField', name: 'tenantName', label: 'Tenant Name', helpText: 'The official name of the tenant' }]
    }]
};

const defaultApprovalConfig = {
    _id: "default_approval_v1",
    name: "Default Approval",
    version: 1,
    phases: [{
        id: 'approval1', name: 'Standard Approval', ownerName: 'Release Manager', ownerEmail: 'release@example.com', sendEmailOnComplete: true, statusOptions: ['Pending', 'Approved', 'Rejected'],
        fields: [{ type: 'Checkbox', name: 'approved', label: 'I approve this request', proof: true }]
    }]
};

export async function seedDatabase() {
  const client = await clientPromise;
  const db = client.db();
  
  let seededCount = 0;
  let skippedCount = 0;

  const seedCollection = async (collectionName: string, data: any[]) => {
    const collection = db.collection(collectionName);
    const count = await collection.countDocuments();
    if (count === 0 && data.length > 0) {
      if (collectionName === 'products') {
        const productsWithId = data.map(p => ({...p, _id: p.name.replace(/[^a-zA-Z0-9]/g, '')}));
        await collection.insertMany(productsWithId);
      } else if (collectionName === 'cmdb_tenants' || collectionName === 'cmdb_components' || collectionName === 'cmdb_applications' || collectionName === 'cmdb_interfaces') {
         await collection.insertMany(data.map(d => ({ ...d, _id: d.id })));
      } else {
        await collection.insertMany(data);
      }
      seededCount++;
      console.log(`Seeded ${collectionName} with ${data.length} documents.`);
    } else {
      skippedCount++;
      console.log(`Skipped seeding ${collectionName}: collection is not empty or no data to seed.`);
    }
  };
  
  await seedCollection('app_catalog', appCatalogData);
  await seedCollection('products', initialProducts);
  await seedCollection('cmdb_tenants', initialTenants);
  await seedCollection('cmdb_components', initialComponents);
  await seedCollection('cmdb_applications', initialApplications);
  await seedCollection('cmdb_interface_types', initialInterfaceTypes);
  await seedCollection('cmdb_interfaces', initialInterfaces);
  await seedCollection('workflows', initialWorkflows);
  await seedCollection('compliance_checks', initialComplianceChecks);
  await seedCollection('deployment_types', initialDeploymentTypes);
  await seedCollection('service_contracts', initialServiceContracts);
  await seedCollection('specification_vendors', initialSpecVendors);
  await seedCollection('specification_hw_types', initialSpecHwTypes);
  await seedCollection('specification_network_cards', initialSpecNetworkCards);
  await seedCollection('specification_plug_power_cords', initialSpecPlugPowerCords);
  await seedCollection('specification_cpu_types', initialSpecCpuTypes);
  await seedCollection('specification_gpu_types', initialSpecGpuTypes);
  await seedCollection('specification_disk_types', initialSpecDiskTypes);
  await seedCollection('specification_hypervisors', initialSpecHypervisors);
  await seedCollection('licenses', initialLicenses);
  await seedCollection('product_licensing', initialProductLicensing);
  await seedCollection('specifications', fullSpecifications);
  await seedCollection('platform_foundations', initialPlatformFoundations);
  await seedCollection('development_environments', initialDevEnvironments);
  await seedCollection('test_environments', initialTestEnvironments);
  await seedCollection('simulators', initialSimulators);
  await seedCollection('emulators', initialEmulators);
  await seedCollection('sdk_apps', initialSdkApps);
  await seedCollection('baselines', initialBaselines);
  await seedCollection('deployments', initialDeployments);

  // Seed settings collections
  await seedCollection('settings_tenant_onboarding', [initialOnboardingConfig]);
  await seedCollection('settings_component_onboarding', [{ ...initialOnboardingConfig, _id: 'default_component_onboarding_v1', name: 'Component Onboarding'}]);
  await seedCollection('settings_application_onboarding', [{ ...initialOnboardingConfig, _id: 'default_application_onboarding_v1', name: 'Application Onboarding'}]);
  await seedCollection('settings_baseline_onboarding', [{ ...initialOnboardingConfig, _id: 'default_baseline_validation_v1', name: 'Baseline Validation'}]);
  
  const approvalTypes = [
    'product_onboarding',
    'tenant_approval',
    'components_approval',
    'application_approval',
    'interface_approval',
    'baseline_approval',
    'deployment_approval',
    'upgrade_approval',
    'migration_approval',
    'decommission_approval',
    'license_approval',
    'export_control_approval',
    'security_approval',
  ];
  
  for (const type of approvalTypes) {
      await seedCollection(`settings_approval_${type}`, [{
          ...defaultApprovalConfig,
          _id: `default_${type}_v1`,
          name: `${type.replace(/_/g, ' ')} Approval`
      }]);
  }

  // After seeding, generate dependency trees
  await generateAndStoreAllProductTrees();
  
  return { seededCount, skippedCount };
}
