name: Trusted Script Execution

on:
  pull_request:
    types: [opened]

jobs:
  review_script:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Review Pull Request
        id: review
        run: echo "Reviewing script..."

      - name: Check if Approved
        id: check_approval
        run: echo "::set-output name=approved::$(echo '${{ github.event.pull_request.body }}' | grep -q 'Approved by maintainer' && echo 'true' || echo 'false')"

      - name: Execute Script
        if: steps.check_approval.outputs.approved == 'true'
        run: |
          echo "Script looks trustworthy and is approved."
          ./your-script.sh

      - name: Notify about Review
        if: steps.check_approval.outputs.approved == 'false'
        run: echo "Script requires approval from a maintainer before execution."
