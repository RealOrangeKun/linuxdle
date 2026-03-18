# Contributing to Linuxdle

Thank you for your interest in contributing to Linuxdle! We welcome community contributions to make the game better, add new content, and fix bugs.

## Licensing and Usage Notice ⚠️

Linuxdle is a **Source-Available** project, not an Open Source Initiative (OSI) approved project. We use the **PolyForm Project License 1.0.0**.

By viewing, downloading, checking out, or modifying this repository, you agree to the following terms:

1. **Permitted Purpose:** You are exclusively granted permission to fork this repository, download the source code, and modify it **solely for the purpose of submitting a Pull Request** back to this main repository.
2. **Prohibited Actions:** You are strictly prohibited from compiling, deploying, hosting, or distributing this software for your own use or for the public. You may not create and host derivatives or clones (e.g., "Linuxdle 2", self-hosted private servers, or localized knockoffs).

If you agree to these terms, we would love your help!

## How to Contribute

1. **Fork the Repository**
   Fork the repository to your own GitHub account.

2. **Create a Branch**
   Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - If you are adding new Daily Distros, Commands, or Desktop Environments, please edit the appropriate JSON files in `seed_data/data/` as outlined in the `seed_data/README.md`.
   - If you are contributing code, ensure you run the local development stack (`docker-compose.dev.yml`) to verify everything works properly.

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat(data): add new feature or distro"
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**
   Open a Pull Request against the `main` branch of this repository. Please provide a clear title and description of the changes you made.

## Intellectual Property Assignment
By submitting a Pull Request, you agree to license your contribution under the same terms as the project and grant the maintainers the right to use and distribute your contribution as part of the official Linuxdle game.

Thank you for keeping Linuxdle amazing for the community! 🐧
