const userRepository = require('../repositories/userRepository');

const getUsers = async () => {
  return await userRepository.getAllUsers();
};

const registerUser = async (data) => {
  // Add business logic here (e.g., validation, check if email exists)
  if (!data.email || !data.name) {
    throw new Error('Email and Name are required');
  }
  return await userRepository.createUser(data);
};

const completeOnboarding = async (userId) => {
  return await userRepository.completeOnboarding(userId);
};

const getUserProfile = async (userId) => {
  // Mock data representing the user profile as requested
  return {
    userId: userId || "mock_user_123",
    fullName: "Alex Morgan",
    pronouns: "(She/Her)",
    headline: "Product Designer at TechFlow | UI/UX Enthusiast | Building Accessible Digital Experiences",
    location: "San Francisco, CA",
    status: "Open to work",
    connectionsCount: "500+",
    followersCount: "1,240",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuClhB0EuID2-HHPWK0-bS5-sBtRlh-M5HJrHnK1rJaw1OVOX_QqpI3HXSYB9smQjhIXyxOQCpI7y4011BeX8j7Vza42m7X9NDfuCS6Qy72FubzApbL5y3-iVvRwYvw6KWAMooBdvUFahj95a43RQWyqyUxkdHE3C4dgKR1bvzN4Ni1MSgvwXV-Z2cHGPzX2EHQwM2uGSYJc5uIr-a2WfYNkDeh_9VFD1L9ELfVqPHR5-e1cbdUATpqeWISTyjngLqgTfgzr1iKJ6qs",
    bannerUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuClhB0EuID2-HHPWK0-bS5-sBtRlh-M5HJrHnK1rJaw1OVOX_QqpI3HXSYB9smQjhIXyxOQCpI7y4011BeX8j7Vza42m7X9NDfuCS6Qy72FubzApbL5y3-iVvRwYvw6KWAMooBdvUFahj95a43RQWyqyUxkdHE3C4dgKR1bvzN4Ni1MSgvwXV-Z2cHGPzX2EHQwM2uGSYJc5uIr-a2WfYNkDeh_9VFD1L9ELfVqPHR5-e1cbdUATpqeWISTyjngLqgTfgzr1iKJ6qs", // Using avatar as placeholder if needed, though frontend uses gradient
    about: "Passionate Product Designer with over 5 years of experience in building user-centric digital products. Specialized in UI/UX design, design systems, and prototyping. Dedicated to creating intuitive and visually appealing interfaces.",
    contactInfo: {
      website: "alexmorgan.design",
      email: "alex.morgan@example.com",
      birthday: "June 15"
    },
    education: [
      {
        id: "edu_1",
        schoolName: "Quy Nhon University",
        degree: "Bachelor of Science in Information Systems",
        years: "2014 - 2018",
        logoUrl: ""
      }
    ],
    skills: ["Figma", "Adobe XD", "HTML5 & CSS3", "User Research", "Prototyping"],
    totalSkillsCount: 12,
    experiences: [
      {
        id: "exp_1",
        title: "Senior Product Designer",
        company: "TechFlow",
        type: "Full-time",
        dateRange: "Jan 2021 - Present",
        duration: "2 yrs 8 mos",
        location: "San Francisco, CA",
        description: "Leading the design team for the core product. Improved user retention by 20% through a complete redesign of the onboarding flow. Manage and maintain the company design system ensuring consistency across all digital touchpoints.",
        skills: ["Figma", "Design Systems"],
        logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD50aMKgO872rVv4Fbwz4xCE0qR1M-RqKtqBk5BNjYKyYZHSV8koK2fDwlF-DO-fF67ukUKKClXN50XhBVKnaed3iOFzDXrRq8fR1g_7Ll21g8GiJjXBbGBKZhAuKLP46fzQkISiU_4CIkkjaeF3RycPhhrytGIR_zjLwYHcCaeo5WelYZ9SDqfrhOsaQXICAFreqDAhymNb3aQMl7TGO2XXb6chVnbKjSg_8ZAaMc2fxROTA2TplSNwDbD4U-0hr5b8dNa-3C-krU"
      },
      {
        id: "exp_2",
        title: "UI Designer",
        company: "Creative Solutions",
        type: "Contract",
        dateRange: "Jun 2018 - Dec 2020",
        duration: "",
        location: "Remote",
        description: "Collaborated with frontend developers to implement responsive designs for various client projects. Created high-fidelity mockups and interactive prototypes using Adobe XD and Sketch.",
        skills: [],
        logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsNsn_BJPMQNzuf9GlaPA2BTVpTVFAkL6Byfp1lubHnoT6HxK0cjarmeIweZRIvjyja5j6nxTDnX3Wt7Oh6qPBvsZ6k8w_aCQMOFvzzviSMPLVz7W21maFEk1nt_GlJiOQqfskZTYWbOBhoT0EgurXr470DWlvjxWSzrzxL6mN_C5HdOTQfNEWUUhPLM2jhLGQME1vPUIJpqHCJZHoohdUeUI3sN0iuY88GPIP8eHCzou3Vw9qXE4LudPJs-K0vfSoE9uzW7Nwqxg"
      }
    ],
    projects: [
      {
        id: "proj_1",
        name: "E-commerce Dashboard Redesign",
        description: "A complete overhaul of the vendor analytics dashboard for a major e-commerce platform, focusing on data visualization.",
        year: "2023",
        category: "UX Research",
        link: "#"
      }
    ],
    certifications: [
      {
        id: "cert_1",
        name: "Google UX Design Certificate",
        organization: "Google",
        issueDate: "Issued Aug 2022 • No Expiration Date",
        logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLq78jSO55MwJnZMOgoAQuVe8l9uirvrzDgUtb_qY1kWtlJkn2XxhbtzbbMcRXk0YLg0WVSO_owpWOcokKlsg2nf4ZAog3DcjiJRCKcw8CPTOPWL3QJXwZWyaftJd4V4zR5jRfXTpqcCODbclFSvO_35T7WZ3FDlyGqjFYNsGKMx61LzefjWgoF5_REWKGEHZpsn7D_WGDA3hWEVFy7wJ8N4iMgNCVGr8bAItRJw9o7aed97eA0uYsqIsiv8APRH7wBYYECrtGuyQ"
      },
      {
        id: "cert_2",
        name: "Enterprise Design Thinking",
        organization: "IBM",
        issueDate: "Issued Mar 2021",
        logoUrl: ""
      }
    ]
  };
};

module.exports = {
  getUsers,
  registerUser,
  completeOnboarding,
  getUserProfile
};
